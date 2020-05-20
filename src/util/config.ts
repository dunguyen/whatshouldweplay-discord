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
