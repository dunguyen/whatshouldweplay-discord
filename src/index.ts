import * as Discord from 'discord.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import logger from './util/logger';
import { getGameModel } from './models/game';

dotenv.config();

if (!process.env.MONGO_URI) {
    logger.error('Missing Mongo URI')
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
Game.find({}, (error, result) => {
    logger.debug(`Games in database: ${result.length}`);
});

const client = new Discord.Client();

client.on('ready', () => {
    logger.info('Bot is ready!');
});

client.on('message', (message) => {
    if (message.content === 'What Should We Play') {
        message.channel.send('Hello World');
    }
})

if (!process.env.DISCORD_TOKEN)
{
    logger.error('No token for Discord');
}

client.login(process.env.DISCORD_TOKEN);