import winston from 'winston';

const debugLogFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.json()
);

const options: winston.LoggerOptions = {
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: debugLogFormat,
        }),
    ],
};
const logger = winston.createLogger(options);

if (process.env.NODE_ENV === 'test') {
    logger.configure({
        silent: true,
    });
}

logger.debug('Logging initialized at debug level');

export default logger;
