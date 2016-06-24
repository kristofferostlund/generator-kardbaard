'use strict'

import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logPath = path.resolve('./.logs/logfile');

if (!fs.existsSync(path.dirname(logPath))) {
  fs.mkdirSync(path.dirname(logPath));
}

/**
 * Logger object, used for logging things to the stream.
 */
const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      json: false,
      colorize: true,
      timestamp: true,
    }),
    new winston.transports.File({
      level: 'debug',
      name: 'logfile',
      filename: './.logs/logfile.log',
      maxsize: 5242880, // 5 MB
    }),
  ],
  exitOnError: true
});

/**
 * Stream object
 */
const stream = {
  /**
   * @param {String} message Message to write to stream
   */
  write: (message) => logger.info(message),
  writeError: (message) => logger.error(message),
};

// Attach the stream to logger.
logger.stream = stream;

export default logger;
