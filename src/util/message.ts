import * as Discord from 'discord.js';
import logger from './logger';
import { updateUserGames } from '../models/userlibrary';
import { resolve } from 'path';

export class Message {
    discordMessage: Discord.Message;
    constructor(discordMessage: Discord.Message) {
        this.discordMessage = discordMessage;
    }

    reply(message: string | string[]): Promise<Discord.Message> {
        return this.discordMessage.reply(message, { split: true });
    }

    async sendDM(message: string | string[]): Promise<void> {
        try {
            await this.discordMessage.author.send(message, { split: true });
            if (this.discordMessage.channel.type === 'dm') {
                return;
            }
            this.discordMessage.reply(`I've sent you a DM with all my commands!`);
        } catch (error) {
            logger.error(`Unable to send DM to ${this.discordMessage.author.tag}`, {
                error,
            });
            this.discordMessage.reply(`It looks like I can't DM you. Do you have DMs enabled?`);
        }
    }

    sendToChannel(message: string | string[]): Promise<Discord.Message> {
        return this.discordMessage.channel.send(message, { split: true });
    }

    getAuthorId(): string {
        return this.discordMessage.author.id;
    }

    getMentionIds(): string[] {
        return this.discordMessage.mentions.users.map((discordUser) => {
            updateUserGames(discordUser.id);
            return discordUser.id;
        });
    }

    isGuild(): boolean {
        return this.discordMessage.guild && this.discordMessage.guild.available;
    }

    async getOnlineGuildMemberIds(): Promise<string[]> {
        if (!this.isGuild()) {
            return new Promise<string[]>((resolve) => {
                resolve([]);
            });
        }

        const guildMembers = await this.discordMessage.guild.members.fetch();
        const onlineGuildMembers = guildMembers.filter((member) => {
            return member.presence.status === 'online' && !member.user.bot;
        });
        return onlineGuildMembers.map((discordUserId) => {
            updateUserGames(discordUserId.id);
            return discordUserId.id;
        });
    }
}
