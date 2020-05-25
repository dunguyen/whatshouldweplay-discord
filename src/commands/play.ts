import * as Discord from 'discord.js';

import { getGameModel } from '../models/game';
import { ICommand } from '../types/ICommand';
import logger from '../util/logger';
import { getOwnedSteamGames, getSteamId } from '../util/request';
import {
    CONFIG_NUMBER_OF_GAMES_DISPLAYED,
    CONFIG_COMMON_GAMES_THRESHOLD,
    CONFIG_SHOW_GAMES_RANDM_ORDER,
} from '../util/config';

const Game = getGameModel();
export class PlayCommand implements ICommand {
    name = 'play';
    description = 'Play';
    args = true;
    usage =
        '<steam username/steam id> <steam username/steam id> <as many usernames/ids you want separated by space>';
    async execute(message: Discord.Message, args: string[]): Promise<void> {
        const ids = await Promise.all(
            args.map((username) => {
                return getSteamId(username);
            })
        );

        const gameLists = await Promise.all(
            ids.map((id) => {
                return getOwnedSteamGames(id);
            })
        );

        const commonGames = {} as { [gameId: number]: number };

        gameLists.forEach((gameList) => {
            gameList.steamAppIds.forEach((gameId) => {
                if (commonGames[gameId]) {
                    commonGames[gameId] = commonGames[gameId] + 1;
                } else {
                    commonGames[gameId] = 1;
                }
            });
        });

        Game.find(
            {
                steamAppId: { $in: Object.keys(commonGames).map(Number) },
                type: 'game',
                'categories.description': 'Multi-player',
            },
            (error, result) => {
                if (error) {
                    logger.error(error);
                    return message.reply('An error has occured :(');
                }
                logger.info(`Number of games found: ${result.length}`);
                let msg = `${CONFIG_NUMBER_OF_GAMES_DISPLAYED} Multi-player games you have in common:\n`;
                const gameList = result
                    .filter((game) => {
                        if (
                            commonGames[game.steamAppId] / args.length >
                            CONFIG_COMMON_GAMES_THRESHOLD
                        ) {
                            return true;
                        } else {
                            return false;
                        }
                    })
                    .map((game) => {
                        return {
                            name: game.name,
                            occurrences: commonGames[game.steamAppId],
                        };
                    });
                logger.info(
                    `Number of games above threshold: ${gameList.length}`
                );

                gameList
                    .sort((a, b) =>
                        CONFIG_SHOW_GAMES_RANDM_ORDER
                            ? 0.5 - Math.random()
                            : b.occurrences - a.occurrences
                    )
                    .splice(CONFIG_NUMBER_OF_GAMES_DISPLAYED);
                gameList.forEach((gameListEntry) => {
                    if (msg.length > 1800) {
                        message.channel.send(msg);
                        msg = ``;
                    }
                    msg += `\n ${gameListEntry.occurrences}\t${gameListEntry.name}`;
                });

                message.channel.send(msg);
            }
        );
    }
}
