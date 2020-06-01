import { getDiscordUserModel } from '../models/discorduser';
import { ICommand } from '../types/ICommand';
import { Message } from '../util/message';

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

        const discordId = message.discordMessage.author.id;

        const filter = { discordUserId: discordId };

        const discordUser = await DiscordUserModel.findOne(filter);

        discordUser.games = discordUser.games.filter((game) => {
            return !args.includes(game.gamertag) && !args.includes(game.accountId);
        });

        if (discordUser.games.length === 0) {
            await discordUser.remove();
            message.reply(
                `Successfully unlinked the account and deleted user as there were no more linked accounts left. You can use link to create a new user.`
            );
            return;
        }
        await discordUser.save();

        message.reply(`Successfully unlinked accounts`);
        return;
    }
}
