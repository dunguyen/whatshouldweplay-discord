import * as Discord from 'discord.js';
import mongoose from 'mongoose';

import logger from './util/logger';
import { getGameModel } from './models/game';
import { MONGO_URI, DISCORD_TOKEN } from './util/config';
import {HelpCommand} from './commands/help';
import {PlayCommand} from './commands/play';
import { ICommand } from './types/ICommand';


mongoose
    .connect(MONGO_URI, {
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
const commands = new Discord.Collection<string, ICommand>();
const helpCommand = new HelpCommand()
const playCommand = new PlayCommand();
commands.set(helpCommand.name, helpCommand);
commands.set(playCommand.name, playCommand);
const prefix = 'wswp';

client.once('ready', () => {
    logger.info('Bot is ready!');
    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'Type "wswp help" for help',
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

    if (message.author.username === 'Chritarn') {
        message.react('🍉');
    }

    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }

    const args = message.content.split(/ +/).slice(1);
    const command = args.shift().toLowerCase();

    if (!commands.has(command)) {
        logger.info(`Command: ${command} not found`)
        return;
    }

    try {
        message.channel.startTyping();
        commands.get(command).execute(message, args);
        message.channel.stopTyping();
    } catch (error) {
        logger.error(error);
    }

});

client.login(DISCORD_TOKEN);
