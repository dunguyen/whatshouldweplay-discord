import * as Discord from 'discord.js';

import { getDiscordUserModel } from '../models/discorduser';
import { ICommand } from '../types/ICommand';
import { getOwnedSteamGames, getSteamId } from '../util/request';
import logger from '../util/logger';

const DiscordUserModel = getDiscordUserModel();
export class ShowLinkedCommand implements ICommand {
    name = 'showlinked';
    description = 'Show the linked ids for the discord user';
    args = false;
    usage = '';
    async execute(message: Discord.Message, args: string[]): Promise<void> {
        const discordId = message.author.id;

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

        if (
            discordUser.length === 0 ||
            !discordUser[0] ||
            !discordUser[0].games ||
            discordUser[0].games.length === 0
        ) {
            message.reply(`I could not find any information on you.`);
            return;
        }

        let reply = `Your linked accounts:`;
        discordUser[0].games.forEach((gameEntry) => {
            if (reply.length > 1800) {
                message.reply(reply);
                reply = ``;
            }
            reply += `\n${gameEntry.platform}: ${
                gameEntry.gamertag ? gameEntry.gamertag : gameEntry.id
            }`;
        });
        reply += `\nTo unlink an account, please use the unlink command.`;

        message.reply(reply);
        return;
    }
}
