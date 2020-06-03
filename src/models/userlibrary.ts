import { getDiscordUserModel } from './discorduser';
import { getGameModel } from './game';
import logger from '../util/logger';
import { CONFIG_USER_LIBRARY_UPDATE_INTERVAL_IN_DAYS } from '../util/config';
import { getOwnedSteamGames, getSteamGamerTag } from '../util/request';

const DiscordUserModel = getDiscordUserModel();
const GameModel = getGameModel();

export const linkSteamGames = async function (
    discordId: string,
    accountId: string,
    steamAppIds: number[],
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

    const games = await GameModel.find({ steamAppId: { $in: steamAppIds } }, { _id: 1 });

    const filter = { discordUserId: discordId };
    const update = {
        $push: {
            games: {
                platform: 'steam',
                accountId: accountId,
                gamertag: steamGamerTag,
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
        return !gamertags.includes(game.gamertag) && !gamertags.includes(game.accountId);
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

    if (
        Math.floor(((Date.now() - user.updatedAt.getTime()) / 1000) * 60 * 60 * 24) >
            CONFIG_USER_LIBRARY_UPDATE_INTERVAL_IN_DAYS ||
        force
    ) {
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
