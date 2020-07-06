import { Player } from '../models/player';
import { getCommonGames } from '../models/userlibrary';
import { ICommand } from '../types/ICommand';
import { Genre } from '../util/genre';
import { getCapitalizedString } from '../util/helpers';
import { Message } from '../util/message';
import { SortOptions } from '../util/sortoptions';

export class PlayCommand implements ICommand {
    name = 'play';
    description = 'Finds multi-player games that you have in common';
    args = false;
    dmOnly = false;
    admin = false;
    examples = ['', '@mention @mention mysteamid'];
    usage = `[optional genre: ${Object.values(Genre).map((x) => x)}] [optional sort: ${Object.values(SortOptions).map(
        (x) => x
    )}] [any number of @mentions, steam username, steam id separated by a space. Steam usernames and ids can be found through logging into https://steamcommunity.com/ and when on the profile, check the value in the URL. Etc. https://steamcommunity.com/id/<your steam username or id>]`;
    async execute(message: Message, args: string[]): Promise<void> {
        const messages = [];
        let genre: Genre;
        let sort: SortOptions;

        if (Genre[getCapitalizedString(args[0])]) {
            genre = Genre[getCapitalizedString(args[0])];
            args.shift();
        }

        if (SortOptions[getCapitalizedString(args[0])]) {
            sort = SortOptions[getCapitalizedString(args[0])];
            args.shift();
        } else {
            sort = SortOptions.Random;
        }

        args = args.filter((arg) => {
            return ['@everyone', '@here'].includes(arg) ? false : true;
        });

        const discordIds: string[] = [];
        if (args.length === 0) {
            const guildDiscordIds = await message.getOnlineGuildMemberIds();
            discordIds.push(...guildDiscordIds);
            messages.push('Checking all online members...');
        }

        discordIds.push(...message.getMentionIds());

        const nonDiscordIds = args.filter((arg) => {
            return !arg.startsWith('<@!') && !arg.endsWith('>');
        });

        const players: Player[] = [];

        players.push(
            ...nonDiscordIds.map((nonDiscordId) => {
                return new Player(nonDiscordId);
            })
        );
        players.push(
            ...discordIds.map((discordId) => {
                return new Player('', discordId);
            })
        );

        await Promise.all(
            players.map((player) => {
                return player.populateGames(genre);
            })
        );

        const playersWithGames = players.filter((player) => {
            return player.hasGames();
        });

        if (playersWithGames.length == 0) {
            messages.push(`No games found for any users.`);
            message.sendToChannel(messages);
            return;
        }

        messages.push(`Found games for ${playersWithGames.length} user${playersWithGames.length > 1 ? 's' : ''}:`);
        messages.push(
            playersWithGames
                .map((player) => {
                    return player.getUserIds();
                })
                .join(', ')
        );

        messages.push(...getCommonGames(playersWithGames, sort));

        message.sendToChannel(messages);
    }
}
