import * as Discord from 'discord.js';

import { getGameModel } from '../models/game';
import { ICommand } from '../types/ICommand';
import logger from '../util/logger';
import { getOwnedSteamGames, getSteamId } from '../util/request';

const Game = getGameModel();
export class PlayCommand implements ICommand{
    name = 'play';
    description = 'Play';
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
                let msg = `Multi-player games you have in common:\n`;
                const threshold = 0.51;
                const gameList = result
                    .filter((game) => {
                        if (
                            commonGames[game.steamAppId] / args.length >
                            threshold
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
                    .sort((a, b) => b.occurrences - a.occurrences)
                    .slice(0, 20);
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

        const commonGamesResult = Object.keys(commonGames).map((key) => {
            return { gameId: key, owners: commonGames[key] };
        });
    };
}
