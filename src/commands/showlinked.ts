import { getDiscordUserModel } from '../models/discorduser';
import { ICommand } from '../types/ICommand';
import logger from '../util/logger';
import { Message } from '../util/message';

const DiscordUserModel = getDiscordUserModel();
export class ShowLinkedCommand implements ICommand {
    name = 'showlinked';
    description = 'Show the linked ids for your discord user';
    args = false;
    usage = '';
    dmOnly = true;
    async execute(message: Message, args: string[]): Promise<void> {
        const discordId = message.discordMessage.author.id;

        const discordUser = await DiscordUserModel.find({
            discordUserId: discordId,
        });

        if (discordUser.length > 1) {
            message.reply(`Sorry but an error has occurred.`);
            logger.error(
                `Erorr in retrieving discord user`,
                { discordUser },
                { command: this.name },
                { discordMessage: message }
            );
            return;
        }

        if (discordUser.length === 0 || !discordUser[0] || !discordUser[0].games || discordUser[0].games.length === 0) {
            message.reply(`I could not find any information on you.`);
            return;
        }

        let reply = `Your linked accounts:`;
        discordUser[0].games.forEach((gameEntry) => {
            reply += `\n${gameEntry.platform}: ${gameEntry.gamertag ? gameEntry.gamertag : gameEntry.accountId}`;
        });
        reply += `\nTo unlink an account, please use the unlink command.`;

        message.reply(reply);
        return;
    }
}
