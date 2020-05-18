import * as Discord from 'discord.js';

import { ICommand } from '../types/ICommand';

export class HelpCommand implements ICommand {
    name = 'help';
    description = 'Help';
    args= false;
    execute(message: Discord.Message, args: string[]): void {
        const msg =
            `What Should We Play helps you find the next multiplayer games that you can play with your friends.\n` +
            'To use What Should We Play, type wswp followed by following commands:\n' +
            `- "play" followed by the steam usernames or ids separated with a space\n` +
            `Example: wswp play <steam username> <steam username>`;
        message.reply(msg);
    }
}
