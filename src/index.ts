import * as Discord from 'discord.js';
import mongoose from 'mongoose';

import { getGameModel } from './models/game';
import { DISCORD_TOKEN, MONGO_URI, CONFIG_PREFIX, setBotId } from './util/config';
import logger from './util/logger';
import { getCommands } from './util/commands';
import { Message } from './util/message';
import { logEvent } from './util/analytics';

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
        logger.error('MongoDB connection error. Please make sure MongoDB is running. ' + err);
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

    setBotId(client.user.id);
});

client.on('message', async (message) => {
    if (!message.content.startsWith(CONFIG_PREFIX) || message.author.bot) {
        return;
    }

    const args = message.content.split(/ +/).slice(1);

    if (!args.length) {
        args.splice(0, 0, 'play');
    }
    let commandName = args[0].toLowerCase();

    if (!commands.has(commandName)) {
        commandName = 'play';
    } else {
        args.shift();
    }

    const command = commands.get(commandName);
    try {
        message.channel.startTyping();

        if (command.dmOnly && message.channel.type != 'dm') {
            message.reply(`This command only works when you DM me. Please send the command again in a DM to me.`);
            return message.channel.stopTyping();
        }

        if (message.guild && command.admin && !message.member.hasPermission('ADMINISTRATOR')) {
            message.reply(
                `You don't have the permission to run this command. Try contacting the channel administrator`
            );
            return message.channel.stopTyping();
        }

        if (command.args && !args.length) {
            let reply = `You need to provide arguments for the ${commandName} command`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${CONFIG_PREFIX} ${commandName} ${command.usage}\``;
            }

            message.channel.send(reply);
            return message.channel.stopTyping(true);
        }

        // eslint-disable-next-line @typescript-eslint/await-thenable
        await command.execute(new Message(message), args);
        logEvent({
            event: 'Command successfully executed',
            commandName: commandName,
            channelId: message.channel.id,
            channelType: message.channel.type,
            commandArgs: args,
            discordUserId: message.author.id,
            result: true,
        });
        return message.channel.stopTyping(true);
    } catch (error) {
        logger.error(`Error with command ${commandName}`, { error: error.message }, { message: message });
        logEvent({
            event: 'Command failed',
            commandName: commandName,
            channelId: message.channel.id,
            channelType: message.channel.type,
            commandArgs: args,
            discordUserId: message.author.id,
            result: true,
        });
        return message.channel.stopTyping(true);
    }
    return message.channel.stopTyping(true);
});

client.login(DISCORD_TOKEN);
