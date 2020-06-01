/* eslint-disable @typescript-eslint/unbound-method */
import { HelpCommand } from '../../src/commands/help';
import { Message } from '../../src/util/message';

jest.mock('../../src/util/message');

describe('help command tests', () => {
    test('wswp help', async () => {
        const helpCommand = new HelpCommand();
        const message = new Message(undefined);
        const args: string[] = [];

        await helpCommand.execute(message, args);
        expect(message.sendDM).toHaveBeenCalledTimes(1);
    });

    test('wswp help help', async () => {
        const helpCommand = new HelpCommand();
        const message = new Message(undefined);
        const args: string[] = ['help'];

        await helpCommand.execute(message, args);
        expect(message.reply).toHaveBeenCalledTimes(1);
    });
});
