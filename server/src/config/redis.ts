import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

export const connectRedis = async (): Promise<void> => {
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('connect', () => {
      logger.info(' Redis connected successfully');
    });

    redis.on('error', (err) => {
      logger.error(' Redis connection error:', err);
    });

    // Test the connection
    await redis.ping();
  } catch (error) {
    logger.error(' Failed to connect to Redis:', error);
  }
};

export const getRedis = (): Redis | null => redis;

export default redis;