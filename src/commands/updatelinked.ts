import { updateUserGames } from '../models/userlibrary';
import { ICommand } from '../types/ICommand';
import { Message } from '../util/message';

export class UpdateLinkedCommand implements ICommand {
    name = 'updatelinked';
    description = `Update all linked accounts. This ordinarily shouldn't be necessary unless you just bought a new game.`;
    args = false;
    usage = '';
    dmOnly = true;
    admin = false;
    async execute(message: Message, args: string[]): Promise<void> {
        await updateUserGames(message.getAuthorId(), true);
        message.reply(`All of your linked profiles have been updated`);
        return;
    }
}
