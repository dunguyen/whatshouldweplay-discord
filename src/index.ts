import * as Discord from 'discord.js';
import mongoose from 'mongoose';

import { getGameModel } from './models/game';
import { DISCORD_TOKEN, MONGO_URI, CONFIG_PREFIX } from './util/config';
import logger from './util/logger';
import { getCommands } from './util/commands';
import { Message } from './util/message';

mongoose
    .connect(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
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
const commands = getCommands();

client.once('ready', () => {
    logger.info('Bot is ready!');
    client.user.setPresence({
        status: 'online',
        activity: {
            name: `Type "${CONFIG_PREFIX} help" for help`,
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

    if (!message.content.startsWith(CONFIG_PREFIX) || message.author.bot) {
        return;
    }

    const args = message.content.split(/ +/).slice(1);
    if (!args.length) {
        return;
    }
    const commandName = args.shift().toLowerCase();

    if (!commands.has(commandName)) {
        logger.info(`Command: ${commandName} not found`);
        return;
    }

    const command = commands.get(commandName);

    try {
        message.channel.startTyping();

        if (command.args && !args.length) {
            let reply = `You need to provide arguments for the ${commandName} command`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${CONFIG_PREFIX} ${commandName} ${command.usage}\``;
            }

            message.channel.send(reply);
            return message.channel.stopTyping();
        }
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await command.execute(new Message(message), args);
        return message.channel.stopTyping();
    } catch (error) {
        logger.error(
            `Error with command ${commandName}`,
            { error },
            { message: message }
        );
        return message.channel.stopTyping();
    }
    return message.channel.stopTyping();
});

client.login(DISCORD_TOKEN);
