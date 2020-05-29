import { getDiscordUserModel } from '../models/discorduser';
import { getGameModel } from '../models/game';
import { ICommand } from '../types/ICommand';
import logger from '../util/logger';
import {
    getOwnedSteamGames,
    getSteamGamerTag,
    getSteamId,
} from '../util/request';
import { Message } from '../util/message';

const DiscordUserModel = getDiscordUserModel();
const GameModel = getGameModel();
export class LinkCommand implements ICommand {
    name = 'link';
    description =
        'Links your discord user with the provided steam id or username';
    args = true;
    usage = '[steam username/id]';
    async execute(message: Message, args: string[]): Promise<void> {
        if (args.length !== 1) {
            message.reply('Please provide exactly one steam username or id');
            return;
        }

        const username = args[0];

        const id = await getSteamId(username);

        const [gameList, steamGamerTag] = await Promise.all([
            getOwnedSteamGames(id),
            getSteamGamerTag(id),
        ]);

        if (!gameList.success) {
            message.reply(`No steam games found for ${username}`);
            return;
        }

        const games = await GameModel.find(
            { steamAppId: { $in: gameList.steamAppIds } },
            { _id: 1 }
        );

        const existingLink = await DiscordUserModel.find({
            discordUserId: message.discordMessage.author.id,
            'games.platform': 'steam',
            'games.accountId': id,
        });
        if (existingLink.length > 0) {
            message.reply(
                'I have already linked this account with your discord.'
            );
            return;
        }

        const filter = { discordUserId: message.discordMessage.author.id };
        const update = {
            $push: {
                games: {
                    platform: 'steam',
                    accountId: id,
                    gamertag: steamGamerTag.steamGamerTag,
                    $currentDate: { lastUpdated: true },
                    games: games.map((game) => {
                        return game.id;
                    }),
                },
            },
        };

        const result = await DiscordUserModel.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true,
            rawResult: true,
        });

        if (result.ok) {
            message.reply(
                `I have successfully linked your id with your discord account!`
            );
        } else {
            logger.error(result);
            message.reply(`I'm sorry, an error has occured`);
        }
        return;
    }
}
