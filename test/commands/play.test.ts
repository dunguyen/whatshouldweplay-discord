/* eslint-disable @typescript-eslint/unbound-method */
import { mocked } from 'ts-jest/utils';

import { PlayCommand } from '../../src/commands/play';
import { Player } from '../../src/models/player';
import * as UserLibrary from '../../src/models/userlibrary';
import { Genre } from '../../src/util/genre';
import { Message } from '../../src/util/message';
import { SortOptions } from '../../src/util/sortoptions';

jest.mock('../../src/util/message');
jest.mock('../../src/models/player');
jest.mock('../../src/models/userlibrary');

describe('play command tests', () => {
    const mockedUserLibrary = mocked(UserLibrary, true);

    beforeEach(() => {
        mockedUserLibrary.getCommonGames.mockImplementation((players, sort) => {
            return [];
        });
        mockedUserLibrary.getCommonGames.mockClear();
    });

    test('wswp play - people online', async () => {
        const playCommand = new PlayCommand();
        const message = new Message(undefined);
        const args: string[] = [];

        message.getOnlineGuildMemberIds = jest.fn(() => {
            return new Promise<string[]>((resolve) => {
                resolve(['test', 'test2']);
            });
        });

        message.isGuild = jest.fn(() => {
            return true;
        });

        message.getMentionIds = jest.fn(() => {
            return [];
        });

        Player.prototype.populateGames = (genre?) => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        };

        Player.prototype.hasGames = () => {
            return true;
        };

        await playCommand.execute(message, args);
        expect(message.sendToChannel).toBeCalledTimes(1);
        expect(UserLibrary.getCommonGames).toHaveBeenCalledTimes(1);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][0]).toHaveLength(2);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][1]).toBe(SortOptions.Random);
    });

    test('wswp play - nobody online', async () => {
        const playCommand = new PlayCommand();
        const message = new Message(undefined);
        const args: string[] = [];

        message.getOnlineGuildMemberIds = jest.fn(() => {
            return new Promise<string[]>((resolve) => {
                resolve([]);
            });
        });

        message.isGuild = jest.fn(() => {
            return true;
        });

        message.getMentionIds = jest.fn(() => {
            return [];
        });

        Player.prototype.populateGames = (genre?) => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        };

        Player.prototype.hasGames = () => {
            return true;
        };

        await playCommand.execute(message, args);
        expect(message.sendToChannel).toBeCalledTimes(1);
        expect(UserLibrary.getCommonGames).toHaveBeenCalledTimes(0);
    });

    test('wswp play @test test - both have games', async () => {
        const playCommand = new PlayCommand();
        const message = new Message(undefined);
        const args: string[] = ['<@!test>', 'test'];

        message.getOnlineGuildMemberIds = jest.fn(() => {
            return new Promise<string[]>((resolve) => {
                resolve([]);
            });
        });

        message.isGuild = jest.fn(() => {
            return true;
        });

        message.getMentionIds = jest.fn(() => {
            return ['mention'];
        });

        Player.prototype.populateGames = (genre?) => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        };

        Player.prototype.hasGames = () => {
            return true;
        };

        await playCommand.execute(message, args);
        expect(message.sendToChannel).toBeCalledTimes(1);
        expect(UserLibrary.getCommonGames).toHaveBeenCalledTimes(1);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][0]).toHaveLength(2);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][1]).toBe(SortOptions.Random);
    });

    test('wswp play @test test - nobody has games', async () => {
        const playCommand = new PlayCommand();
        const message = new Message(undefined);
        const args: string[] = ['<@!test>', 'test'];

        message.getOnlineGuildMemberIds = jest.fn(() => {
            return new Promise<string[]>((resolve) => {
                resolve([]);
            });
        });

        message.isGuild = jest.fn(() => {
            return true;
        });

        message.getMentionIds = jest.fn(() => {
            return ['mention'];
        });

        Player.prototype.populateGames = (genre?) => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        };

        Player.prototype.hasGames = () => {
            return false;
        };

        await playCommand.execute(message, args);
        expect(message.sendToChannel).toBeCalledTimes(1);
        expect(UserLibrary.getCommonGames).toHaveBeenCalledTimes(0);
    });

    test('wswp play action test @test', async () => {
        const playCommand = new PlayCommand();
        const message = new Message(undefined);
        const args: string[] = ['action', '<@!test>', 'test'];

        message.getOnlineGuildMemberIds = jest.fn(() => {
            return new Promise<string[]>((resolve) => {
                resolve([]);
            });
        });

        message.isGuild = jest.fn(() => {
            return true;
        });

        message.getMentionIds = jest.fn(() => {
            return ['mention'];
        });

        Player.prototype.populateGames = (genre?) => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        };

        jest.spyOn(Player.prototype, 'populateGames');

        Player.prototype.hasGames = () => {
            return true;
        };

        await playCommand.execute(message, args);
        expect(message.sendToChannel).toBeCalledTimes(1);
        expect(UserLibrary.getCommonGames).toHaveBeenCalledTimes(1);
        expect(Player.prototype.populateGames).toHaveBeenCalledWith(Genre.Action);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][0]).toHaveLength(2);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][1]).toBe(SortOptions.Random);
    });

    test('wswp play playtime test @test', async () => {
        const playCommand = new PlayCommand();
        const message = new Message(undefined);
        const args: string[] = ['playtime', '<@!test>', 'test'];

        message.getOnlineGuildMemberIds = jest.fn(() => {
            return new Promise<string[]>((resolve) => {
                resolve([]);
            });
        });

        message.isGuild = jest.fn(() => {
            return true;
        });

        message.getMentionIds = jest.fn(() => {
            return ['mention'];
        });

        Player.prototype.populateGames = (genre?) => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        };

        Player.prototype.hasGames = () => {
            return true;
        };

        await playCommand.execute(message, args);
        expect(message.sendToChannel).toBeCalledTimes(1);
        expect(UserLibrary.getCommonGames).toHaveBeenCalledTimes(1);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][0]).toHaveLength(2);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][1]).toBe(SortOptions.Playtime);
    });

    test('wswp play strategy playtime test @test', async () => {
        const playCommand = new PlayCommand();
        const message = new Message(undefined);
        const args: string[] = ['strategy', 'playtime', '<@!test>', 'test'];

        message.getOnlineGuildMemberIds = jest.fn(() => {
            return new Promise<string[]>((resolve) => {
                resolve([]);
            });
        });

        message.isGuild = jest.fn(() => {
            return true;
        });

        message.getMentionIds = jest.fn(() => {
            return ['mention'];
        });

        Player.prototype.populateGames = (genre?) => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        };

        jest.spyOn(Player.prototype, 'populateGames');

        Player.prototype.hasGames = () => {
            return true;
        };

        await playCommand.execute(message, args);
        expect(message.sendToChannel).toBeCalledTimes(1);
        expect(UserLibrary.getCommonGames).toHaveBeenCalledTimes(1);
        expect(Player.prototype.populateGames).toHaveBeenCalledWith(Genre.Strategy);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][0]).toHaveLength(2);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][1]).toBe(SortOptions.Playtime);
    });

    test('wswp play playtime action test @test', async () => {
        const playCommand = new PlayCommand();
        const message = new Message(undefined);
        const args: string[] = ['playtime', 'action', '<@!test>', 'test'];

        message.getOnlineGuildMemberIds = jest.fn(() => {
            return new Promise<string[]>((resolve) => {
                resolve([]);
            });
        });

        message.isGuild = jest.fn(() => {
            return true;
        });

        message.getMentionIds = jest.fn(() => {
            return ['mention'];
        });

        Player.prototype.populateGames = (genre?) => {
            return new Promise<void>((resolve) => {
                resolve();
            });
        };

        jest.spyOn(Player.prototype, 'populateGames');

        Player.prototype.hasGames = () => {
            return true;
        };

        await playCommand.execute(message, args);
        expect(message.sendToChannel).toBeCalledTimes(1);
        expect(UserLibrary.getCommonGames).toHaveBeenCalledTimes(1);
        expect(Player.prototype.populateGames).toHaveBeenCalledWith(undefined);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][0]).toHaveLength(3);
        expect(mockedUserLibrary.getCommonGames.mock.calls[0][1]).toBe(SortOptions.Playtime);
    });
});
