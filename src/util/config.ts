import dotenv from 'dotenv';

import logger from './logger';

dotenv.config();

if (!process.env.STEAM_API_KEY) {
    logger.error('Missing Steam API key');
}

export const STEAM_API_KEY = process.env.STEAM_API_KEY;

if (!process.env.MONGO_URI) {
    logger.error('Missing Mongo URI');
}

export const MONGO_URI = process.env.MONGO_URI;

if (!process.env.DISCORD_TOKEN) {
    logger.error('No token for Discord');
}

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

logger.debug(`Node Env is: ${process.env.NODE_ENV}`);

export const CONFIG_NUMBER_OF_GAMES_DISPLAYED = process.env.CONFIG_NUMBER_OF_GAMES_DISPLAYED
    ? parseInt(process.env.CONFIG_NUMBER_OF_GAMES_DISPLAYED, 10)
    : 5;

export const CONFIG_COMMON_GAMES_THRESHOLD = process.env.CONFIG_COMMON_GAMES_THRESHOLD
    ? parseInt(process.env.CONFIG_COMMON_GAMES_THRESHOLD, 10)
    : 0.8;

export const CONFIG_SHOW_GAMES_RANDM_ORDER = process.env.CONFIG_SHOW_GAMES_RANDM_ORDER
    ? process.env.CONFIG_SHOW_GAMES_RANDM_ORDER
    : true;

export const CONFIG_PREFIX = process.env.CONFIG_PREFIX ? process.env.CONFIG_PREFIX : 'wswp';

export const CONFIG_USER_LIBRARY_UPDATE_INTERVAL_IN_DAYS = process.env.CONFIG_USER_LIBRARY_UPDATE_INTERVAL_IN_DAYS
    ? parseInt(process.env.CONFIG_USER_LIBRARY_UPDATE_INTERVAL_IN_DAYS, 10)
    : 7;

export let BOT_ID = '';

export const setBotId = function (botId: string): void {
    BOT_ID = botId;
};
