import * as Discord from "discord.js";

export interface ICommand {
    name: string;
    description: string;
    execute(message: Discord.Message, args: string[]): void
}