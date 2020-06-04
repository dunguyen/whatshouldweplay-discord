import { ICommand } from '../types/ICommand';
import { getOwnedSteamGames, getSteamGamerTag, getSteamId } from '../util/request';
import { Message } from '../util/message';
import { linkSteamGames } from '../models/userlibrary';

export class LinkCommand implements ICommand {
    name = 'link';
    description = 'Links your discord user with the provided steam id or username';
    args = true;
    usage = '[steam username/id]';
    async execute(message: Message, args: string[]): Promise<void> {
        if (args.length !== 1) {
            message.reply('Please provide exactly one steam username or id');
            return;
        }

        const username = args[0];

        const id = await getSteamId(username);

        const [gameList, steamGamerTag] = await Promise.all([getOwnedSteamGames(id), getSteamGamerTag(id)]);

        if (!gameList.success) {
            message.reply(`No steam games found for ${username}`);
            return;
        }

        const result = await linkSteamGames(
            message.getAuthorId(),
            id,
            gameList.steamAppIds,
            steamGamerTag.steamGamerTag
        );

        if (result.success) {
            message.reply(`I have successfully linked your id with your discord account!`);
        } else {
            message.reply(result.error);
        }
        return;
    }
}