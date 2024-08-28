const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, colorize, printf } = winston.format;

require('dotenv').config()

// text format used on the console level
const consoleLogFormat = printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}] ${message}`;
});
// json format used on the rotated log files
const jsonLogFormat = printf(({ timestamp, level, message }) => {
    return `{'timestamp': '${timestamp}' 'level': '${level}', 'message': '${message}'}`;
});

// rotated json file log
const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/debug-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    format: combine (jsonLogFormat)
  });

// Create a logger instance
const logger = winston.createLogger({
    // level: process.env.LOG_LEVEL, // in case we need to restreict specifc levels
    format: combine(
        timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
    ),
    transports: [
        new winston.transports.Console({
          format: combine(
            colorize(),
            consoleLogFormat
          )}),
        fileRotateTransport
    ],
});

// // Wrapper function to include request ID in log messages
const logWithRequestId = (level, message, requestId) => {
  if (requestId) {
      logger.log(level, `[${requestId}] ${message}`);
  } else {
      logger.log(level, message);
  }
};

module.exports = {
  debug: (message, requestId) => logWithRequestId('debug', message, requestId),
  info: (message, requestId) => logWithRequestId('info', message, requestId),
  error: (message, requestId) => logWithRequestId('error', message, requestId)
};
