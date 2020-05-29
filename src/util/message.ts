import * as Discord from 'discord.js';
import logger from './logger';

export class Message {
    discordMessage: Discord.Message;
    constructor(discordMessage: Discord.Message) {
        this.discordMessage = discordMessage;
    }

    reply(message: string | string[]): Promise<Discord.Message> {
        return this.discordMessage.reply(message, { split: true });
    }

    sendDM(message: string | string[], notifyInChannel = true): Promise<void> {
        return this.discordMessage.author
            .send(message, { split: true })
            .then(() => {
                if (this.discordMessage.channel.type === 'dm') {
                    return;
                }
                this.discordMessage.reply(
                    `I've sent you a DM with all my commands!`
                );
            })
            .catch((error) => {
                logger.error(
                    `Unable to send DM to ${this.discordMessage.author.tag}`,
                    {
                        error,
                    }
                );
                this.discordMessage.reply(
                    `It looks like I can't DM you. Do you have DMs enabled?`
                );
            });
    }

    sendToChannel(message: string | string[]): Promise<Discord.Message> {
        return this.discordMessage.channel.send(message, { split: true });
    }
}
