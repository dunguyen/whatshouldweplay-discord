import Discord from 'discord.js';

import { ICommand } from '../types/ICommand';
import { HelpCommand } from '../commands/help';
import { PlayCommand } from '../commands/play';
import { LinkCommand } from '../commands/link';
import { UnlinkCommand } from '../commands/unlink';
import { ShowLinkedCommand } from '../commands/showlinked';

export const getCommands = function (): Discord.Collection<string, ICommand> {
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

    return commands;
};
