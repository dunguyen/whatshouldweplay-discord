import * as Discord from "discord.js";

export interface ICommand {
    name: string;
    description: string;
    args: boolean;
    usage?: string;
    execute(message: Discord.Message, args: string[]): void
}