import { ICommand } from '../types/ICommand';
import { Message } from '../util/message';
import { updateUserGames, getCommonGames } from '../models/userlibrary';
import { getCapitalizedString } from '../util/helpers';
import { Genre } from '../util/genre';
import { SortOptions } from '../util/sortoptions';
import { Player } from '../models/player';

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

        const discordIds: string[] = [];

        if (args.length === 0 && message.discordMessage.guild && message.discordMessage.guild.available) {
            const guildMembers = await message.discordMessage.guild.members.fetch();
            const onlineGuildMembers = guildMembers.filter((member) => {
                return member.presence.status === 'online' && !member.user.bot;
            });
            discordIds.push(
                ...onlineGuildMembers.map((discordUserId) => {
                    updateUserGames(discordUserId.id);
                    return discordUserId.id;
                })
            );
        }

        if (args.length === 0 && !message.discordMessage.guild) {
            discordIds.push(message.getAuthorId());
        }

        discordIds.push(
            ...message.discordMessage.mentions.users.map((discordUser) => {
                updateUserGames(discordUser.id);
                return discordUser.id;
            })
        );

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
