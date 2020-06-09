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
    examples = ['play', 'link'];
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
            data.push(
                `TIP: Writing '${CONFIG_PREFIX}' is the same as '${CONFIG_PREFIX} play' so you can more quickly use the play command. Arguments are the same as the play command. See more by typing '${CONFIG_PREFIX} help play.'`
            );
            data.push(`TIP: In a DM to me, you don't need to prefix the command with ${CONFIG_PREFIX}`);

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
        if (command.examples) {
            command.examples.forEach((example) => {
                data.push(`Example: ${CONFIG_PREFIX} ${command.name} ${example}`);
            });
        }
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
