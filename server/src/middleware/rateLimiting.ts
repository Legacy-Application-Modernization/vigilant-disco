import rateLimit from 'express-rate-limit';

// General API rate limiting (conservative for free tier)
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '50'), // 50 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
  // Removed keyGenerator to avoid type conflicts - will use default IP-based limiting
});

// Health check rate limiting
export const healthCheckLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    message: 'Health check rate limit exceeded',
    error: 'HEALTH_CHECK_RATE_LIMIT_EXCEEDED'
  }
});

export default {
  generalLimiter,
  healthCheckLimiter
};