import { getDiscordUserModel } from '../models/discorduser';
import { getGameModel } from '../models/game';
import { ICommand } from '../types/ICommand';
import {
    CONFIG_COMMON_GAMES_THRESHOLD,
    CONFIG_NUMBER_OF_GAMES_DISPLAYED,
    CONFIG_SHOW_GAMES_RANDM_ORDER,
} from '../util/config';
import logger from '../util/logger';
import { Message } from '../util/message';
import { getOwnedSteamGames, getSteamId } from '../util/request';

const DiscordUserModel = getDiscordUserModel();
const Game = getGameModel();
export class PlayCommand implements ICommand {
    name = 'play';
    description = 'Finds multi-player games that you have in common';
    args = true;
    usage = '[@mention, steam username, steam id separated by a space]';
    async execute(message: Message, args: string[]): Promise<void> {
        const discordIds = message.discordMessage.mentions.users.map((discordUser) => {
            return discordUser.id;
        });

        const sanitizedArgs = args.filter((arg) => {
            return !arg.startsWith('<@!') && !arg.endsWith('>');
        });

        const ids = await Promise.all(
            sanitizedArgs.map((username) => {
                return getSteamId(username);
            })
        );

        const gameLists = await Promise.all(
            ids.map((id) => {
                return getOwnedSteamGames(id);
            })
        );

        // Get discord users and their games
        const discordUsers = await DiscordUserModel.find({
            discordUserId: { $in: discordIds },
        }).populate({
            path: 'games.games',
            match: {
                type: 'game',
                'categories.description': 'Multi-player',
            },
        });

        // Construct the commonGames array
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
        discordUsers.forEach((user) => {
            let mergedGames = [];
            user.games.forEach((game) => {
                mergedGames = [...mergedGames, ...game.games];
            });
            mergedGames
                .filter((item, index) => mergedGames.indexOf(item) === index)
                .forEach((game) => {
                    if (commonGames[game.steamAppId]) {
                        commonGames[game.steamAppId] = commonGames[game.steamAppId] + 1;
                    } else {
                        commonGames[game.steamAppId] = 1;
                    }
                });
        });

        const games = await Game.find({
            steamAppId: { $in: Object.keys(commonGames).map(Number) },
            type: 'game',
            'categories.description': 'Multi-player',
        });

        const gameList = games
            .filter((game) => {
                if (commonGames[game.steamAppId] / args.length > CONFIG_COMMON_GAMES_THRESHOLD) {
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

        logger.info(`Number of games found: ${games.length}`);
        let msg = `${CONFIG_NUMBER_OF_GAMES_DISPLAYED} Multi-player games you have in common:\n`;
        logger.info(`Number of games above threshold: ${gameList.length}`);

        gameList
            .sort((a, b) => (CONFIG_SHOW_GAMES_RANDM_ORDER ? 0.5 - Math.random() : b.occurrences - a.occurrences))
            .splice(CONFIG_NUMBER_OF_GAMES_DISPLAYED);
        gameList.forEach((gameListEntry) => {
            msg += `\n ${gameListEntry.occurrences}\t${gameListEntry.name}`;
        });

        message.sendToChannel(msg);
    }
}
