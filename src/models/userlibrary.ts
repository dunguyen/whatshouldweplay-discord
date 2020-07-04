import { getDiscordUserModel } from './discorduser';
import { getGameModel, GameDocument } from './game';
import logger from '../util/logger';
import { CONFIG_USER_LIBRARY_UPDATE_INTERVAL_IN_DAYS, CONFIG_NUMBER_OF_GAMES_DISPLAYED } from '../util/config';
import { getOwnedSteamGames, getSteamGamerTag } from '../util/request';
import { Player } from './player';
import { SortOptions } from '../util/sortoptions';
import { getMedian } from '../util/helpers';

const DiscordUserModel = getDiscordUserModel();
const GameModel = getGameModel();

export const linkSteamGames = async function (
    discordId: string,
    accountId: string,
    steamAppIds: { appId: number; playtime: number }[],
    steamGamerTag: string
): Promise<{ success: boolean; error: string }> {
    const existingLink = await DiscordUserModel.find({
        discordUserId: discordId,
        'games.platform': 'steam',
        'games.accountId': accountId,
    });

    if (existingLink.length > 0) {
        return { success: false, error: 'I have already linked this account with your discord.' };
    }

    const appIds = steamAppIds.map((game) => {
        return game.appId;
    });
    const games = await GameModel.find({ steamAppId: { $in: appIds } }, { _id: 1, steamAppId: 1 });
    const gamesWithPlaytime = games.map((g) => {
        const matchedGame = steamAppIds.find((element) => {
            return element.appId == g.steamAppId;
        });
        const playtime = matchedGame ? matchedGame.playtime : 0;
        return {
            game: g.id,
            playtime: playtime,
        };
    });

    const filter = { discordUserId: discordId };
    const update = {
        $push: {
            games: {
                platform: 'steam',
                accountId: accountId,
                gamertag: steamGamerTag,
                $currentDate: { lastUpdated: true },
                games: gamesWithPlaytime,
            },
        },
    };

    const result = await DiscordUserModel.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
        rawResult: true,
    });

    if (result.ok) {
        return { success: true, error: '' };
    } else {
        logger.error(result);
        return {
            success: false,
            error: `I'm sorry. I could not link the steam account ${accountId} with your discord`,
        };
    }
};

export const unLinkSteamGames = async function (
    discordId: string,
    gamertags: string[]
): Promise<{ success: boolean; message: string }> {
    const filter = { discordUserId: discordId };

    const discordUser = await DiscordUserModel.findOne(filter);

    discordUser.games = discordUser.games.filter((game) => {
        return !gamertags.includes(game.gamertag.toLowerCase()) && !gamertags.includes(game.accountId.toLowerCase());
    });

    if (discordUser.games.length === 0) {
        await discordUser.remove();
        return {
            success: true,
            message: `Successfully unlinked the account and deleted user as there were no more linked accounts left. You can use link to create a new user.`,
        };
    }

    await discordUser.save();
    return {
        success: true,
        message: `Successfully unlinked accounts.`,
    };
};

export const updateUserGames = async function (discordUserId: string, force = false): Promise<void> {
    const user = await DiscordUserModel.findOne({ discordUserId: discordUserId });

    if (!user) {
        return;
    }

    if (
        Math.floor((Date.now() - user.updatedAt.getTime()) / (1000 * 60 * 60 * 24)) >
            CONFIG_USER_LIBRARY_UPDATE_INTERVAL_IN_DAYS ||
        force
    ) {
        logger.info('update user');
        const userGameAccounts = user.games.map((g) => {
            return { platform: g.platform, id: g.accountId };
        });

        user.games = [];
        userGameAccounts.forEach(async (g) => {
            const [gameList, steamGamerTag] = await Promise.all([getOwnedSteamGames(g.id), getSteamGamerTag(g.id)]);
            if (gameList.success && steamGamerTag.success) {
                linkSteamGames(discordUserId, g.id, gameList.steamAppIds, steamGamerTag.steamGamerTag);
            }
        });

        user.save();
    }
};

export const getCommonGames = function (players: Player[], sort?: SortOptions): string[] {
    const messages: string[] = [];

    const commonGames = new Map<string, { game: GameDocument; playtimes: number[]; owned: Player[] }>();
    players.forEach((player) => {
        player.games.forEach((gameData) => {
            if (commonGames.has(gameData.game.id)) {
                const commonGame = commonGames.get(gameData.game.id);
                commonGame.owned.push(player);
                commonGame.playtimes.push(gameData.playtime);
                commonGames.set(gameData.game.id, commonGame);
            } else {
                commonGames.set(gameData.game.id, {
                    game: gameData.game,
                    playtimes: [gameData.playtime],
                    owned: [player],
                });
            }
        });
    });

    const games = Array.from(commonGames.values());
    let threshold = 1;
    while (
        games.filter((g) => {
            if (g.owned.length / players.length >= threshold) {
                return true;
            } else {
                return false;
            }
        }).length < CONFIG_NUMBER_OF_GAMES_DISPLAYED ||
        threshold < 0
    ) {
        threshold -= 0.1;
    }

    const gameList = games
        .filter((gameData) => {
            if (gameData.owned.length / players.length >= threshold) {
                return true;
            } else {
                return false;
            }
        })
        .map((gameData) => {
            let score = 0;
            if (gameData.game.steamReviewScore && gameData.game.steamReviewScore.reviewScore) {
                score = gameData.game.steamReviewScore.reviewScore;
            }
            if (gameData.game.metacritic && gameData.game.metacritic.score) {
                score += gameData.game.metacritic.score;
                score /= 2;
            }
            return {
                name: gameData.game.name,
                numberOwned: gameData.owned.length,
                medianPlaytime: getMedian(gameData.playtimes),
                score: score,
            };
        });

    messages.push(`${CONFIG_NUMBER_OF_GAMES_DISPLAYED} Multi-player games you have in common:`);

    messages.push(`Number of players who own\tGame name`);
    if (sort === SortOptions.Playtime) {
        gameList.sort((a, b) => b.medianPlaytime - a.medianPlaytime);
    } else if (sort === SortOptions.Score) {
        gameList.sort((a, b) => b.score - a.score);
    } else if (sort === SortOptions.Random) {
        gameList.sort((a, b) => 0.5 - Math.random());
    } else {
        gameList.sort((a, b) => b.numberOwned - a.numberOwned);
    }
    gameList.splice(CONFIG_NUMBER_OF_GAMES_DISPLAYED);
    gameList.forEach((gameListEntry) => {
        messages.push(`${gameListEntry.numberOwned}\t${gameListEntry.name}`);
    });
    return messages;
};
