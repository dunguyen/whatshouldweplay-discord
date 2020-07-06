import { ICommand } from '../types/ICommand';
import { Message } from '../util/message';
import { getDiscordUserModel } from '../models/discorduser';

const DiscordUserModel = getDiscordUserModel();
export class DeleteCommand implements ICommand {
    name = 'delete';
    description = 'Delete all the account links to your discord';
    args = false;
    usage = '';
    dmOnly = true;
    admin = false;
    async execute(message: Message, args: string[]): Promise<void> {
        const discordId = message.getAuthorId();
        await DiscordUserModel.findOneAndDelete({ discordUserId: discordId });
        const result = await DiscordUserModel.findOne({ discordUserId: discordId });

        if (result) {
            message.reply(`An error has occurred, the account links have not been deleted.`);
        } else {
            message.reply(`Your account links have been deleted.`);
        }
        return;
    }
}
