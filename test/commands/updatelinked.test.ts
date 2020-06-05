/* eslint-disable @typescript-eslint/unbound-method */
import { Message } from '../../src/util/message';
import { updateUserGames } from '../../src/models/userlibrary';
import { UpdateLinkedCommand } from '../../src/commands/updatelinked';

jest.mock('../../src/util/message');
jest.mock('../../src/models/userlibrary');

describe('link command tests', () => {
    test('wswp updatelinked', async () => {
        const updateLinkedCommand = new UpdateLinkedCommand();
        const message = new Message(undefined);
        const args: string[] = [];
        message.getAuthorId = jest.fn(() => {
            return 'authorid';
        });

        await updateLinkedCommand.execute(message, args);
        expect(message.reply).toHaveBeenCalledTimes(1);
        expect(updateUserGames).toHaveBeenCalledTimes(1);
        expect(updateUserGames).toHaveBeenCalledWith('authorid', true);
    });
});
