import * as Discord from 'discord.js';
import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const client = new Discord.Client();
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({level: 'debug'})
    ]
})

client.on('ready', () => {
    logger.info('Bot is ready!');
});

client.on('message', (message) => {
    if (message.content === 'What Should We Play') {
        message.channel.send('Hello World');
    }
})

if (!process.env.DISCORD_TOKEN)
{
    logger.error('No token for Discord');
}

client.login(process.env.DISCORD_TOKEN);