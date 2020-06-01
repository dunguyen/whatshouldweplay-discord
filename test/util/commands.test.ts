import { getCommands } from '../../src/util/commands';
import { HelpCommand } from '../../src/commands/help';
import { ShowLinkedCommand } from '../../src/commands/showlinked';
import { UnlinkCommand } from '../../src/commands/unlink';
import { LinkCommand } from '../../src/commands/link';
import { PlayCommand } from '../../src/commands/play';

describe('commands tests', () => {
    test('getCommands returns collection', () => {
        const commands = getCommands();

        expect(commands.size).toBe(5);
        expect(commands.get('help') instanceof HelpCommand).toBeTruthy();
        expect(commands.get('play') instanceof PlayCommand).toBeTruthy();
        expect(commands.get('link') instanceof LinkCommand).toBeTruthy();
        expect(commands.get('unlink') instanceof UnlinkCommand).toBeTruthy();
        expect(commands.get('showlinked') instanceof ShowLinkedCommand).toBeTruthy();
    });
});
