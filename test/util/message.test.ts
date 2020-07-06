/* eslint-disable @typescript-eslint/unbound-method */
import { DMChannel, Message as DiscordMessage, TextChannel, User } from 'discord.js';

import { Message } from '../../src/util/message';

jest.mock('discord.js');

describe('message tests', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    const generateTestString = function (): string {
        return 'test' + (Math.random() * 100).toString();
    };

    test('reply with string', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        const message = new Message(discordMessageMock);
        const msg = generateTestString();

        message.reply(msg);

        expect(discordMessageMock.reply).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.reply).toHaveBeenCalledWith(msg, { split: true });
    });

    test('reply with array of string', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        const message = new Message(discordMessageMock);
        const msg = [generateTestString(), generateTestString()];

        message.reply(msg);

        expect(discordMessageMock.reply).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.reply).toHaveBeenCalledWith(msg, { split: true });
    });

    test('reply with empty string', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        const message = new Message(discordMessageMock);

        message.reply('');

        expect(discordMessageMock.reply).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.reply).toHaveBeenCalledWith('', { split: true });
    });

    test('reply with empty array', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        const message = new Message(discordMessageMock);

        message.reply([]);

        expect(discordMessageMock.reply).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.reply).toHaveBeenCalledWith([], { split: true });
    });

    test('sendDM with string on text channel', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        discordMessageMock.author = new User(undefined, undefined);
        discordMessageMock.channel = new TextChannel(undefined);
        const message = new Message(discordMessageMock);
        const msg = generateTestString();

        message.sendDM(msg);

        expect(discordMessageMock.author.send).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.author.send).toHaveBeenCalledWith(msg, { split: true });
    });

    test('sendDM with string on dm channel', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        discordMessageMock.author = new User(undefined, undefined);
        discordMessageMock.channel = new DMChannel(undefined);
        const message = new Message(discordMessageMock);
        const msg = generateTestString();

        message.sendDM(msg);

        expect(discordMessageMock.author.send).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.author.send).toHaveBeenCalledWith(msg, { split: true });
    });

    test('sendDM with string array', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        discordMessageMock.author = new User(undefined, undefined);
        discordMessageMock.channel = new TextChannel(undefined);
        const message = new Message(discordMessageMock);
        const msg = [generateTestString(), generateTestString()];

        message.sendDM(msg);

        expect(discordMessageMock.author.send).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.author.send).toHaveBeenCalledWith(msg, { split: true });
    });

    test('sendDM with empty string', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        discordMessageMock.author = new User(undefined, undefined);
        discordMessageMock.channel = new TextChannel(undefined);
        const message = new Message(discordMessageMock);

        message.sendDM('');

        expect(discordMessageMock.author.send).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.author.send).toHaveBeenCalledWith('', { split: true });
    });

    test('sendDM with empty array', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        discordMessageMock.author = new User(undefined, undefined);
        discordMessageMock.channel = new TextChannel(undefined);
        const message = new Message(discordMessageMock);

        message.sendDM([]);

        expect(discordMessageMock.author.send).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.author.send).toHaveBeenCalledWith([], { split: true });
    });

    test('sendToChannel with string', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        discordMessageMock.channel = new TextChannel(undefined);
        const message = new Message(discordMessageMock);
        const msg = generateTestString();

        message.sendToChannel(msg);

        expect(discordMessageMock.channel.send).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.channel.send).toHaveBeenCalledWith(msg, { split: true });
    });
    test('sendToChannel with DM Channel', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        discordMessageMock.channel = new DMChannel(undefined);
        discordMessageMock.channel.type = 'dm';
        const message = new Message(discordMessageMock);
        const msg = generateTestString();

        message.sendToChannel(msg);

        expect(discordMessageMock.channel.send).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.channel.send).toHaveBeenCalledWith(msg, { split: true });
    });

    test('sendToChannel with string array', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        discordMessageMock.channel = new TextChannel(undefined);
        const message = new Message(discordMessageMock);
        const msg = [generateTestString(), generateTestString()];

        message.sendToChannel(msg);

        expect(discordMessageMock.channel.send).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.channel.send).toHaveBeenCalledWith(msg, { split: true });
    });

    test('sendToChannel with empty string', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        discordMessageMock.channel = new TextChannel(undefined);
        const message = new Message(discordMessageMock);

        message.sendToChannel('');

        expect(discordMessageMock.channel.send).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.channel.send).toHaveBeenCalledWith('', { split: true });
    });

    test('sendToChannel with empty array', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        discordMessageMock.channel = new TextChannel(undefined);
        const message = new Message(discordMessageMock);

        message.sendToChannel([]);

        expect(discordMessageMock.channel.send).toHaveBeenCalledTimes(1);
        expect(discordMessageMock.channel.send).toHaveBeenCalledWith([], { split: true });
    });

    test('getAuthorId', () => {
        const discordMessageMock = new DiscordMessage(undefined, undefined, undefined);
        discordMessageMock.author = new User(undefined, undefined);
        const id = generateTestString();
        discordMessageMock.author.id = id;
        const message = new Message(discordMessageMock);

        const result = message.getAuthorId();

        expect(result).toBe(id);
    });
});
