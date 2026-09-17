import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';
import AppError from '../utils/appError.js';

let globalLimiter = null;

// 1. This function will be called ONLY after Redis connects
export const initRateLimiter = () => {
  globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    handler: (req, res, next) => {
      next(new AppError('Too many requests from this IP, please try again in 15 minutes.', 429));
    },
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: 'rate-limit:global:',
    }),
  });
  console.log('🛡️   Rate Limiter initialized with Redis');
};

// 2. This is the wrapper that Express uses in app.use()
export const apiLimiter = (req, res, next) => {
  if (!globalLimiter) {
    // Safety net: if someone hits the API before boot finishes, let them through
    return next(); 
  }
  // Pass the request into the real limiter
  return globalLimiter(req, res, next);
};