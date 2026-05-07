const pino = require('pino');
const config = require('../config/env');

// Create logger instance with appropriate configuration
const logger = pino({
    level: config.logLevel,
    transport: config.nodeEnv !== 'production' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    } : undefined,
    formatters: {
        level: (label) => {
            return { level: label };
        }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Redact sensitive information
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
        remove: true
    }
});

module.exports = logger;
