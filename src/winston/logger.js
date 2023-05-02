const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'site', path: '' },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
            format: winston.format.errors(
                winston.format.timestamp(),
                winston.format.printf(({ level, message, timestamp }) => {
                    return `${timestamp}, ${level}, ${message}`;
                })
            )
        }),
        new winston.transports.File({
            filename: 'combined.log',
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ level, message, timestamp, path }) => {
                    return `${timestamp}, ${level}, ${path}, ${message}`;
                })
            )
        })
    ]
});

function logInfo(message, meta) {
    logger.log({ level: 'info', message, meta });
}

function logWarn(message, meta) {
    logger.log({ level: 'warn', message, meta });
}

module.exports = { logger, logInfo, logWarn };