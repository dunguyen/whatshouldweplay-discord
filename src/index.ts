import * as Discord from 'discord.js';
import mongoose from 'mongoose';

import { HelpCommand } from './commands/help';
import { PlayCommand } from './commands/play';
import { getGameModel } from './models/game';
import { ICommand } from './types/ICommand';
import { DISCORD_TOKEN, MONGO_URI } from './util/config';
import logger from './util/logger';
import { LinkCommand } from './commands/link';
import { ShowLinkedCommand } from './commands/showlinked';
import { UnlinkCommand } from './commands/unlink';

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
const commands = new Discord.Collection<string, ICommand>();
const helpCommand = new HelpCommand();
const playCommand = new PlayCommand();
const linkCommand = new LinkCommand();
const unlinkCommand = new UnlinkCommand();
const showLinkedCommand = new ShowLinkedCommand();
commands.set(helpCommand.name, helpCommand);
commands.set(playCommand.name, playCommand);
commands.set(linkCommand.name, linkCommand);
commands.set(unlinkCommand.name, unlinkCommand);
commands.set(showLinkedCommand.name, showLinkedCommand);
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

    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }

    const args = message.content.split(/ +/).slice(1);
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
                reply += `\nThe proper usage would be: \`${prefix} ${commandName} ${command.usage}\``;
            }

            message.channel.send(reply);
            return message.channel.stopTyping();
        }
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await command.execute(message, args);
        return message.channel.stopTyping();
    } catch (error) {
        logger.error(`Error in index.ts`, { error }, { message: message });
        return message.channel.stopTyping();
    }
});

client.login(DISCORD_TOKEN);
