import winston from 'winston';
import path from 'path';

const logDir = process.env.LOG_DIR || 'logs';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'legacy-modernization' },
  transports: [
    // Only use file transports in non-Vercel environments (Vercel filesystem is read-only)
    ...(process.env.VERCEL !== '1' ? [
      new winston.transports.File({ 
        filename: path.join(logDir, 'error.log'), 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: path.join(logDir, 'combined.log') 
      }),
    ] : []),
  ],
});

// Always log to console (Vercel captures these)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL === '1') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export { logger };