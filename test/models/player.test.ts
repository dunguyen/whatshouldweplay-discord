import { Player } from '../../src/models/player';

jest.mock('../../src/util/request');
jest.mock('../../src/models/game');

describe('player tests', () => {
    test('player no id', () => {
        const player = new Player();
        const userId = player.getUserIds();
        const hasGames = player.hasGames();

        expect(userId).toBe('');
        expect(hasGames).toBeFalsy();
    });

    test('player steam id', () => {
        const player = new Player('steam id');
        const userId = player.getUserIds();
        const hasGames = player.hasGames();

        expect(userId).toBe('steam id');
        expect(hasGames).toBeFalsy();
    });

    test('player discord id', () => {
        const player = new Player('', 'discord');
        const userId = player.getUserIds();
        const hasGames = player.hasGames();

        expect(userId).toBe('<@discord>');
        expect(hasGames).toBeFalsy();
    });

    test('player both id', () => {
        const player = new Player('steam id', 'discord');
        const userId = player.getUserIds();
        const hasGames = player.hasGames();

        expect(userId).toBe('steam id/<@discord>');
        expect(hasGames).toBeFalsy();
    });
});
