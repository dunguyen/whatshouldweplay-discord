import * as Discord from 'discord.js';

import { getDiscordUserModel } from '../models/discorduser';
import { getGameModel } from '../models/game';
import { ICommand } from '../types/ICommand';
import {
    getOwnedSteamGames,
    getSteamId,
    getSteamGamerTag,
} from '../util/request';
import logger from '../util/logger';

const DiscordUserModel = getDiscordUserModel();
const GameModel = getGameModel();
export class LinkCommand implements ICommand {
    name = 'link';
    description = 'Link the discord user with steam id';
    args = true;
    usage = '<steam username/id>';
    async execute(message: Discord.Message, args: string[]): Promise<void> {
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

        const filter = { discordUserId: message.author.id };
        const update = {
            $push: {
                games: {
                    platform: 'steam',
                    id: id,
                    gamertag: steamGamerTag.steamGamerTag,
                    $currentDate: { lastUpdated: true },
                    games: games.map((game) => {
                        return game.id;
                    }),
                },
            },
        };

        const existingLink = await DiscordUserModel.find({
            discordUserId: message.author.id,
            'games.platform': 'steam',
            'games.id': id,
        });
        if (existingLink.length > 0) {
            message.reply(
                'I have already linked this account with your discord.'
            );
            return;
        }

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
