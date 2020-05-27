import * as Discord from 'discord.js';

import { getDiscordUserModel } from '../models/discorduser';
import { ICommand } from '../types/ICommand';

const DiscordUserModel = getDiscordUserModel();
export class UnlinkCommand implements ICommand {
    name = 'unlink';
    description = 'Unlink the discord user with steam id';
    args = true;
    usage = '<steam gamertag/id> <steam gamertag/id>';
    async execute(message: Discord.Message, args: string[]): Promise<void> {
        if (args.length === 0) {
            message.reply('Please provide at least one steam gamertag or id');
            return;
        }

        const discordId = message.author.id;

        const filter = { discordUserId: discordId };

        const discordUser = await DiscordUserModel.findOne(filter);

        discordUser.games = discordUser.games.filter((game) => {
            return (
                !args.includes(game.gamertag) && !args.includes(game.accountId)
            );
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
