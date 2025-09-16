import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD || undefined,
});

export const accountLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl-account',
  points: 5,            // 5 requests
  duration: 1,          // per 1 second
  blockDuration: 60,    // block for 60 sec if consumed
});

// middleware
export const perAccountLimiterMiddleware = async (req, res, next) => {
  const token = req.headers['cl-x-token'];
  if (!token) return res.status(400).json({ success:false, message: 'Missing CL-X-TOKEN' });

  // use token (or account id) as the key
  try {
    await accountLimiter.consume(token);
    next();
  } catch (rej) {
    return res.status(429).json({ success:false, message: 'Too many requests for this account' });
  }
};
