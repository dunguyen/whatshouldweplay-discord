import { getDiscordUserModel } from '../models/discorduser';
import { ICommand } from '../types/ICommand';
import { Message } from '../util/message';
import { unLinkSteamGames } from '../models/userlibrary';

const DiscordUserModel = getDiscordUserModel();
export class UnlinkCommand implements ICommand {
    name = 'unlink';
    description = 'Unlink your discord user with steam id';
    args = true;
    usage = '[steam id or steam gamertag from the showlinked command]';
    async execute(message: Message, args: string[]): Promise<void> {
        if (args.length === 0) {
            message.reply('Please provide at least one steam gamertag or id');
            return;
        }

        const result = await unLinkSteamGames(message.discordMessage.author.id, args);
        message.reply(result.message);
        return;
    }
}
