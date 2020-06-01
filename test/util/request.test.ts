import axios from 'axios';

import { getOwnedSteamGames, getSteamGamerTag, getSteamId } from '../../src/util/request';

jest.mock('axios');

describe('request tests', () => {
    test('getSteamId returns result if successful', async () => {
        const axiosMock = jest
            .spyOn(axios, 'get')
            .mockImplementation((url: string) => {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: { response: { steamid: '1234', success: 1 } },
                    });
                });
            })
            .mockClear();

        const steamId = await getSteamId('username');

        expect(axiosMock).toHaveBeenCalledTimes(1);
        expect(steamId).toBe('1234');
    });

    test('getSteamId returns result if unsuccessful', async () => {
        const axiosMock = jest
            .spyOn(axios, 'get')
            .mockImplementation((url: string) => {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            response: { message: 'No match', success: 42 },
                        },
                    });
                });
            })
            .mockClear();

        const steamId = await getSteamId('username');

        expect(axiosMock).toHaveBeenCalledTimes(1);
        expect(steamId).toBe('username');
    });

    test('getOwnedSteamGames returns result if successful', async () => {
        const appId1 = Math.floor(Math.random() * 1000);
        const appId2 = Math.floor(Math.random() * 1000);
        const axiosMock = jest
            .spyOn(axios, 'get')
            .mockImplementation((url: string) => {
                return new Promise((resolve, reject) => {
                    resolve({
                        status: 200,
                        data: {
                            response: {
                                games: [{ appid: appId1 }, { appid: appId2 }],
                            },
                        },
                    });
                });
            })
            .mockClear();

        const games = await getOwnedSteamGames('id');

        expect(axiosMock).toHaveBeenCalledTimes(1);
        expect(games.success).toBeTruthy();
        expect(games.steamAppIds).toHaveLength(2);
        expect(games.steamAppIds).toContain(appId1);
        expect(games.steamAppIds).toContain(appId2);
    });

    test('getOwnedSteamGames returns result if unsuccessful', async () => {
        const axiosMock = jest
            .spyOn(axios, 'get')
            .mockImplementation((url: string) => {
                return new Promise((resolve, reject) => {
                    resolve({
                        status: 500,
                        data: {
                            response: {},
                        },
                    });
                });
            })
            .mockClear();

        const games = await getOwnedSteamGames('id');

        expect(axiosMock).toHaveBeenCalledTimes(1);
        expect(games.success).toBeFalsy();
        expect(games.steamAppIds).toHaveLength(0);
    });

    test('getSteamGamerTag returns result if successful', async () => {
        const axiosMock = jest
            .spyOn(axios, 'get')
            .mockImplementation((url: string) => {
                return new Promise((resolve, reject) => {
                    resolve({
                        status: 200,
                        data: {
                            response: {
                                players: [{ steamid: '1234', personaname: 'test' }],
                            },
                        },
                    });
                });
            })
            .mockClear();

        const gamertag = await getSteamGamerTag('1234');

        expect(axiosMock).toHaveBeenCalledTimes(1);
        expect(gamertag.success).toBeTruthy();
        expect(gamertag.steamGamerTag).toBe('test');
    });

    test('getSteamGamerTag returns result if unsuccessful', async () => {
        const axiosMock = jest
            .spyOn(axios, 'get')
            .mockImplementation((url: string) => {
                return new Promise((resolve, reject) => {
                    resolve({
                        status: 200,
                        data: {
                            response: {
                                players: [],
                            },
                        },
                    });
                });
            })
            .mockClear();

        const gamertag = await getSteamGamerTag('1234');

        expect(axiosMock).toHaveBeenCalledTimes(1);
        expect(gamertag.success).toBeFalsy();
        expect(gamertag.steamGamerTag).toBe('');
    });
});
