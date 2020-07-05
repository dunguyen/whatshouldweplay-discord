import { DeleteCommand } from '../../src/commands/delete';
import { HelpCommand } from '../../src/commands/help';
import { LinkCommand } from '../../src/commands/link';
import { PlayCommand } from '../../src/commands/play';
import { PruneCommand } from '../../src/commands/prune';
import { ShowLinkedCommand } from '../../src/commands/showlinked';
import { UnlinkCommand } from '../../src/commands/unlink';
import { UpdateLinkedCommand } from '../../src/commands/updatelinked';
import { getCommands } from '../../src/util/commands';

describe('commands tests', () => {
    test('getCommands returns collection', () => {
        const commands = getCommands();

        expect(commands.size).toBe(8);
        expect(commands.get('help') instanceof HelpCommand).toBeTruthy();
        expect(commands.get('play') instanceof PlayCommand).toBeTruthy();
        expect(commands.get('link') instanceof LinkCommand).toBeTruthy();
        expect(commands.get('unlink') instanceof UnlinkCommand).toBeTruthy();
        expect(commands.get('showlinked') instanceof ShowLinkedCommand).toBeTruthy();
        expect(commands.get('updatelinked') instanceof UpdateLinkedCommand).toBeTruthy();
        expect(commands.get('prune') instanceof PruneCommand).toBeTruthy();
        expect(commands.get('delete') instanceof DeleteCommand).toBeTruthy();
    });
});
