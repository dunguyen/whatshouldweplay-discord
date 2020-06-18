import { getCommands } from '../../src/util/commands';
import { HelpCommand } from '../../src/commands/help';
import { ShowLinkedCommand } from '../../src/commands/showlinked';
import { UnlinkCommand } from '../../src/commands/unlink';
import { LinkCommand } from '../../src/commands/link';
import { PlayCommand } from '../../src/commands/play';
import { UpdateLinkedCommand } from '../../src/commands/updatelinked';
import { PruneCommand } from '../../src/commands/prune';
import { DeleteCommand } from '../../src/commands/delete';

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
