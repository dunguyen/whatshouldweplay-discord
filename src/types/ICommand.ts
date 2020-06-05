import { Message } from '../util/message';

export interface ICommand {
    name: string;
    description: string;
    args: boolean;
    usage?: string;
    dmOnly: boolean;
    admin: boolean;
    execute(message: Message, args: string[]): void;
}
