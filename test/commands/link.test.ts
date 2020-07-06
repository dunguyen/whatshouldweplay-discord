/* eslint-disable @typescript-eslint/unbound-method */
import { LinkCommand } from '../../src/commands/link';
import * as Userlibrary from '../../src/models/userlibrary';
import { Message } from '../../src/util/message';
import * as Request from '../../src/util/request';

jest.mock('../../src/util/message');
jest.mock('../../src/util/request');
jest.mock('../../src/models/userlibrary');

describe('link command tests', () => {
    test('wswp link', async () => {
        const linkCommand = new LinkCommand();
        const message = new Message(undefined);
        const args: string[] = [];

        await linkCommand.execute(message, args);
        expect(message.reply).toHaveBeenCalledTimes(1);
        expect(Userlibrary.linkSteamGames).toHaveBeenCalledTimes(0);
    });

    test('wswp link test', async () => {
        const linkCommand = new LinkCommand();
        const message = new Message(undefined);
        const args: string[] = ['test'];

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

        const getSteamGamerTagMock = jest
            .spyOn(Request, 'getSteamGamerTag')
            .mockImplementation((id) => {
                return new Promise((resolve) => {
                    resolve({ success: true, steamGamerTag: 'gamertag' });
                });
            })
            .mockClear();

        const linkSteamGamesMock = jest
            .spyOn(Userlibrary, 'linkSteamGames')
            .mockImplementation((id) => {
                return new Promise((resolve) => {
                    resolve({ success: true, error: '' });
                });
            })
            .mockClear();

        message.getAuthorId = jest.fn(() => {
            return 'authorid';
        });

        await linkCommand.execute(message, args);
        expect(message.reply).toHaveBeenCalledTimes(1);
        expect(Request.getSteamId).toHaveBeenCalledTimes(1);
        expect(Request.getSteamGamerTag).toHaveBeenCalledTimes(1);
        expect(Request.getOwnedSteamGames).toHaveBeenCalledTimes(1);
        expect(Userlibrary.linkSteamGames).toHaveBeenCalledTimes(1);
        expect(Userlibrary.linkSteamGames).toHaveBeenCalledWith(
            'authorid',
            '1234',
            [
                { appId: 1, playtime: 0 },
                { appId: 2, playtime: 0 },
                { appId: 3, playtime: 0 },
                { appId: 4, playtime: 0 },
            ],
            'gamertag'
        );
    });

    test('wswp link test error in linking', async () => {
        const linkCommand = new LinkCommand();
        const message = new Message(undefined);
        const args: string[] = ['test'];

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

        const getSteamGamerTagMock = jest
            .spyOn(Request, 'getSteamGamerTag')
            .mockImplementation((id) => {
                return new Promise((resolve) => {
                    resolve({ success: true, steamGamerTag: 'gamertag' });
                });
            })
            .mockClear();

        const linkSteamGamesMock = jest
            .spyOn(Userlibrary, 'linkSteamGames')
            .mockImplementation((id) => {
                return new Promise((resolve) => {
                    resolve({ success: false, error: 'error message' });
                });
            })
            .mockClear();

        message.getAuthorId = jest.fn(() => {
            return 'authorid';
        });

        await linkCommand.execute(message, args);
        expect(message.reply).toHaveBeenCalledTimes(1);
        expect(message.reply).toHaveBeenCalledWith('error message');
        expect(Request.getSteamId).toHaveBeenCalledTimes(1);
        expect(Request.getSteamGamerTag).toHaveBeenCalledTimes(1);
        expect(Request.getOwnedSteamGames).toHaveBeenCalledTimes(1);
        expect(Userlibrary.linkSteamGames).toHaveBeenCalledTimes(1);
        expect(Userlibrary.linkSteamGames).toHaveBeenCalledWith(
            'authorid',
            '1234',
            [
                { appId: 1, playtime: 0 },
                { appId: 2, playtime: 0 },
                { appId: 3, playtime: 0 },
                { appId: 4, playtime: 0 },
            ],
            'gamertag'
        );
    });

    test('wswp link test error, no games', async () => {
        const linkCommand = new LinkCommand();
        const message = new Message(undefined);
        const args: string[] = ['test'];

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
                    resolve({ success: false, steamAppIds: [], id: id });
                });
            })
            .mockClear();

        const getSteamGamerTagMock = jest
            .spyOn(Request, 'getSteamGamerTag')
            .mockImplementation((id) => {
                return new Promise((resolve) => {
                    resolve({ success: true, steamGamerTag: 'gamertag' });
                });
            })
            .mockClear();

        const linkSteamGamesMock = jest
            .spyOn(Userlibrary, 'linkSteamGames')
            .mockImplementation((id) => {
                return new Promise((resolve) => {
                    resolve({ success: false, error: 'error message' });
                });
            })
            .mockClear();

        message.getAuthorId = jest.fn(() => {
            return 'authorid';
        });

        await linkCommand.execute(message, args);
        expect(message.reply).toHaveBeenCalledTimes(1);
        expect(Request.getSteamId).toHaveBeenCalledTimes(1);
        expect(Request.getSteamGamerTag).toHaveBeenCalledTimes(1);
        expect(Request.getOwnedSteamGames).toHaveBeenCalledTimes(1);
        expect(Userlibrary.linkSteamGames).toHaveBeenCalledTimes(0);
    });

    test('wswp link test test2', async () => {
        const linkCommand = new LinkCommand();
        const message = new Message(undefined);
        const args: string[] = ['test', 'test2'];

        await linkCommand.execute(message, args);
        expect(message.reply).toHaveBeenCalledTimes(1);
        expect(Userlibrary.linkSteamGames).toHaveBeenCalledTimes(0);
    });
});
