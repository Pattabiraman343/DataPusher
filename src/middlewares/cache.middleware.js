import Redis from "ioredis";

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD || undefined,
});

export const cache = (keyPrefix) => async (req, res, next) => {
  try {
    // Use query params to create unique key
    const key = keyPrefix + JSON.stringify(req.query || req.params || {});

    const cachedData = await redisClient.get(key);
    if (cachedData) {
        console.log("✅ Cache hit:", key);
        return res.json(JSON.parse(cachedData));
      }
      

    // Override res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      redisClient.setex(key, 60, JSON.stringify(data)); // cache 60 sec
      return originalJson(data);
    };

    next();
  } catch (err) {
    console.error("Redis cache error:", err);
    next();
  }
};
