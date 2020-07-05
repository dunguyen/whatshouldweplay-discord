import { Player } from '../../src/models/player';
import * as Request from '../../src/util/request';
import * as Game from '../../src/models/game';

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

    test('player populate steam games', () => {
        const player = new Player('steam id');
        const userId = player.getUserIds();
        const hasGames = player.hasGames();

        const getSteamIdMock = jest
            .spyOn(Request, 'getSteamId')
            .mockImplementation((username) => {
                return new Promise((resolve) => {
                    resolve('1234');
                });
            })
            .mockClear();

        const getOwnedSteamGamesMock = jest
            .spyOn(Request, 'getOwnedSteamGames')
            .mockImplementation((id) => {
                return new Promise((resolve) => {
                    resolve({
                        success: true,
                        steamAppIds: [
                            { appId: 1, playtime: 0 },
                            { appId: 2, playtime: 0 },
                            { appId: 3, playtime: 0 },
                            { appId: 4, playtime: 0 },
                        ],
                        id: id,
                    });
                });
            })
            .mockClear();

        const gameFindMock = jest
            .spyOn(Game, 'find')
            .mockImplementation((filter) => {
                return new Promise((resolve) => {
                    resolve([new GameDocument(), new GameDocument(), new GameDocument(), new GameDocument()]);
                });
            })
            .mockClear();

        expect(userId).toBe('steam id');
        expect(hasGames).toBeTruthy();
    });
});
