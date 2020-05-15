import * as Discord from 'discord.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import logger from './util/logger';
import { getGameModel } from './models/game';
import { getSteamId, getOwnedSteamGames } from './util/request';

dotenv.config();

if (!process.env.MONGO_URI) {
    logger.error('Missing Mongo URI');
}

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    })
    .catch((err) => {
        logger.error(
            'MongoDB connection error. Please make sure MongoDB is running. ' +
                err
        );
    });

const Game = getGameModel();
Game.countDocuments({}, (error, result) => {
    logger.debug(`Games in database: ${result}`);
});

const client = new Discord.Client();

client.on('ready', () => {
    logger.info('Bot is ready!');
    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'Type "wswp" for help',
            type: 'PLAYING',
        },
    });
});

client.on('message', async (message) => {
    // If not in a server, return
    if (!message.guild) {
        logger.debug(`Message sent outside guild`);
        return;
    }

    if (message.author === client.user) {
        return;
    }

    if (message.author.username === 'Chritarn') {
        message.react('🍉');
    }

    const messageContent = message.toString().toLowerCase();
    const keyword = 'wswp';

    if (messageContent === keyword) {
        const msg =
            `What Should We Play helps you find the next multiplayer games that you can play with your friends.\n` +
            'To use What Should We Play, type wswp followed by following commands:\n' +
            `- "play" followed by the steam usernames or ids separated with a space\n` +
            `Example: wswp play <steam username> <steam username>`;
        message.reply(msg);
        return;
    }

    if (messageContent.startsWith(keyword)) {
        const args = messageContent.split(' ');
        logger.debug(args);

        if (args[1] === 'play') {
            const steamUsernames = args.slice(2);
            const ids = await Promise.all(
                steamUsernames.map((username) => {
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
                                commonGames[game.steamAppId] /
                                    steamUsernames.length >
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

                    gameList.sort((a, b) => b.occurrences - a.occurrences).slice(0, 25);
                    logger.info(gameList)
                    gameList.forEach((gameListEntry) => {
                        msg += `\n ${gameListEntry.occurrences}\t${gameListEntry.name}`;
                    });

                    message.channel.send(msg);
                }
            );

            const commonGamesResult = Object.keys(commonGames).map((key) => {
                return { gameId: key, owners: commonGames[key] };
            });
        }
    }
});

if (!process.env.DISCORD_TOKEN) {
    logger.error('No token for Discord');
}

client.login(process.env.DISCORD_TOKEN);
