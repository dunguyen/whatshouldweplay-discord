import { ICommand } from '../types/ICommand';
import { Message } from '../util/message';
import { updateUserGames } from '../models/userlibrary';

export class UpdateLinkedCommand implements ICommand {
    name = 'updatelinked';
    description = 'Update all linked accounts';
    args = false;
    usage = '';
    async execute(message: Message, args: string[]): Promise<void> {
        await updateUserGames(message.getAuthorId(), true);
        message.reply(`All of your linked profiles have been updated`);
        return;
    }
}
