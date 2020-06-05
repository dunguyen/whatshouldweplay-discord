import { ICommand } from '../types/ICommand';
import { Message } from '../util/message';
import { CONFIG_PREFIX, BOT_ID } from '../util/config';

export class PruneCommand implements ICommand {
    name = 'prune';
    description =
        'Takes the last 50 messages and prunes those that are messages starting with wswp, and messages by the bot';
    args = false;
    usage = '';
    dmOnly = false;
    admin = true;
    async execute(message: Message, args: string[]): Promise<void> {
        if (message.discordMessage.channel.type === 'text') {
            const allMessages = await message.discordMessage.channel.messages.fetch();
            const messagesToPrune = allMessages.filter((msg) => {
                return !msg.pinned && (msg.content.startsWith(CONFIG_PREFIX) || msg.author.id === BOT_ID);
            });
            await message.discordMessage.channel.bulkDelete(messagesToPrune);
            message.sendToChannel(`Deleted ${messagesToPrune.size} messages`);
        } else {
            message.reply(`This command is not available on this channel type!`);
        }
    }
}
