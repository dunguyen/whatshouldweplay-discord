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
import { updateUserGames } from '../models/userlibrary';
import { getMedian } from '../util/math';

const DiscordUserModel = getDiscordUserModel();
const Game = getGameModel();
export class PlayCommand implements ICommand {
    name = 'play';
    description = 'Finds multi-player games that you have in common';
    args = false;
    dmOnly = false;
    admin = false;
    examples = ['', '@mention @mention mysteamid'];
    usage =
        '[optional genre: action|strategy|rpg|sports|simulation|casual|racing] [optional sort: playtime|score] [any number of @mentions, steam username, steam id separated by a space. Steam usernames and ids can be found through logging into https://steamcommunity.com/ and when on the profile, check the value in the URL. Etc. https://steamcommunity.com/id/<your steam username or id>]';
    async execute(message: Message, args: string[]): Promise<void> {
        const msg = [];
        let genre = '';
        let sort = '';
        if (['action', 'strategy', 'rpg', 'sports', 'simulation', 'casual', 'racing'].includes(args[0])) {
            genre = args.shift();
            genre = genre.charAt(0).toUpperCase() + genre.slice(1);
        }

        if (['playtime', 'score'].includes(args[0])) {
            sort = args.shift();
        } else {
            sort = 'random';
        }

        const discordIds = [];

        if (args.length === 0 && message.discordMessage.guild && message.discordMessage.guild.available) {
            const guildMembers = await message.discordMessage.guild.members.fetch();
            const onlineGuildMembers = guildMembers.filter((member) => {
                return member.presence.status === 'online';
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

        let discordUserMatch: {
            type: string;
            'categories.description': string;
            'genres.description'?: string;
        } = {
            type: 'game',
            'categories.description': 'Multi-player',
        };

        if (genre) {
            discordUserMatch = {
                type: 'game',
                'categories.description': 'Multi-player',
                'genres.description': genre,
            };
        }

        // Get discord users and their games
        const discordUsers = await DiscordUserModel.find({
            discordUserId: { $in: discordIds },
        }).populate({
            path: 'games.games.game',
            match: discordUserMatch,
        });

        const invalidTextIds = gameLists
            .filter((g) => {
                return !g.success;
            })
            .map((g) => {
                return g.id;
            });
        const foundDiscordUsers = discordUsers.map((discordUserDocument) => {
            return discordUserDocument.discordUserId;
        });
        const unknownDiscordUsers = discordIds.filter((discordId) => {
            return !foundDiscordUsers.includes(discordId);
        });

        if (invalidTextIds.length > 0 || unknownDiscordUsers.length > 0) {
            let unknownUsersMessage = `Could not find games for these users: `;
            invalidTextIds.forEach((invalidTextId) => {
                unknownUsersMessage += `${invalidTextId} `;
            });
            unknownDiscordUsers.forEach((unknownDiscordUser) => {
                unknownUsersMessage += `<@${unknownDiscordUser}> `;
            });
            msg.push(unknownUsersMessage);
        }

        const remainingUsers =
            sanitizedArgs.length + discordIds.length - invalidTextIds.length - unknownDiscordUsers.length;
        if (remainingUsers === 0) {
            msg.push(
                `Could not find user info for anyone. Please ensure you have the correct steam username or link your profile using the 'wswp link' command`
            );
            message.sendToChannel(msg);
            return;
        }

        // Construct the commonGames array
        const commonGames = {} as { [gameId: number]: { owned: number; playtimes: number[] } };
        gameLists.forEach((gameList) => {
            gameList.steamAppIds.forEach((gameId) => {
                if (commonGames[gameId.appId]) {
                    commonGames[gameId.appId].owned += 1;
                    commonGames[gameId.appId].playtimes.push(gameId.playtime);
                } else {
                    commonGames[gameId.appId] = { owned: 1, playtimes: [gameId.playtime] };
                }
            });
        });
        discordUsers.forEach((user) => {
            let mergedGames = [];
            user.games.forEach((account) => {
                mergedGames = [...mergedGames, ...account.games];
            });
            mergedGames
                .filter((item) => item.game)
                .forEach((game) => {
                    const steamAppId = game.game.steamAppId;
                    if (commonGames[steamAppId]) {
                        commonGames[steamAppId].owned += 1;
                        commonGames[steamAppId].playtimes.push(game.playtime);
                    } else {
                        commonGames[steamAppId] = { owned: 1, playtimes: [game.playtime] };
                    }
                });
        });

        if (Object.keys(commonGames).length === 0) {
            message.sendToChannel(`No games found for any users`);
            return;
        }

        let gameFilter: {
            steamAppId: {
                $in: number[];
            };
            type: string;
            'categories.description': string;
            'genres.description'?: string;
        } = {
            steamAppId: { $in: Object.keys(commonGames).map(Number) },
            type: 'game',
            'categories.description': 'Multi-player',
        };

        if (genre) {
            gameFilter = {
                steamAppId: { $in: Object.keys(commonGames).map(Number) },
                type: 'game',
                'categories.description': 'Multi-player',
                'genres.description': genre,
            };
        }

        const games = await Game.find(gameFilter);
        const threshold = CONFIG_COMMON_GAMES_THRESHOLD;

        msg.push(`Found games of ${remainingUsers} users`);
        const gameList = games
            .filter((game) => {
                if (commonGames[game.steamAppId].owned / remainingUsers > threshold) {
                    return true;
                } else {
                    return false;
                }
            })
            .map((game) => {
                let score = 0;
                if (game.steamReviewScore && game.steamReviewScore.reviewScore) {
                    score = game.steamReviewScore.reviewScore;
                }
                if (game.metacritic && game.metacritic.score) {
                    score += game.metacritic.score;
                    score /= 2;
                }
                return {
                    name: game.name,
                    occurrences: commonGames[game.steamAppId].owned,
                    medianPlaytime: getMedian(commonGames[game.steamAppId].playtimes),
                    score: score,
                };
            });

        logger.info(`Number of games found: ${games.length}`);
        msg.push(`${CONFIG_NUMBER_OF_GAMES_DISPLAYED} Multi-player games you have in common:`);
        logger.info(`Number of games above threshold: ${gameList.length}`);

        msg.push(`Number of players who own\tGame name`);
        if (sort === 'playtime') {
            gameList.sort((a, b) => b.medianPlaytime - a.medianPlaytime);
        } else if (sort === 'score') {
            gameList.sort((a, b) => b.score - a.score);
        } else if (sort === 'random') {
            gameList.sort((a, b) => 0.5 - Math.random());
        } else {
            gameList.sort((a, b) => b.occurrences - a.occurrences);
        }
        gameList.splice(CONFIG_NUMBER_OF_GAMES_DISPLAYED);
        gameList.forEach((gameListEntry) => {
            msg.push(`${gameListEntry.occurrences}\t${gameListEntry.name}`);
        });

        message.sendToChannel(msg);
    }
}
