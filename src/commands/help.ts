import { ICommand } from '../types/ICommand';
import { getCommands } from '../util/commands';
import { CONFIG_PREFIX } from '../util/config';
import { Message } from '../util/message';

export class HelpCommand implements ICommand {
    name = 'help';
    description = 'Lists all commands or info about a specific command';
    args = false;
    usage = '[command name]';
    dmOnly = false;
    admin = false;
    execute(message: Message, args: string[]): Promise<void> {
        const data: string[] = [];
        const commands = getCommands();

        if (!args.length) {
            data.push(
                `What Should We Play helps you find the next multiplayer games that you can play with your friends.`
            );
            data.push(`Supported commands:`);
            data.push(
                commands
                    .map((command) => {
                        return command.name;
                    })
                    .join(', ')
            );
            data.push(`You can send ${CONFIG_PREFIX} help [command name] to get info on a specific command.`);

            return message.sendDM(data);
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name);

        if (!command) {
            message.reply(`That's not a valid command!`);
            return;
        }

        data.push(`Command name: ${command.name}`);
        if (command.description) {
            data.push(`Description: ${command.description}`);
        }
        data.push(`How to use: ${CONFIG_PREFIX} ${command.name} ${command.usage}`);
        if (command.dmOnly) {
            data.push(`This command will only work if you DM me to avoid spamming the channel`);
        }
        if (command.admin) {
            data.push(`This command can only be run by a channel admin`);
        }

        message.reply(data);
        return;
    }
}
