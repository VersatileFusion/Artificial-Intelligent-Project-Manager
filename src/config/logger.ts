import winston from 'winston';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const logLevel = process.env.LOG_LEVEL || 'info';
const logFilePath = process.env.LOG_FILE_PATH || './logs/app.log';

// Create logs directory if it doesn't exist
const logsDir = path.dirname(logFilePath);
if (logsDir !== '.') {
  require('fs').mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: logFilePath }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Create a stream object for Morgan integration
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

export default logger; 