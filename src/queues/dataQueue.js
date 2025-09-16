import Bull from "bull";

// Redis config
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD || undefined, // optional password
};


// Create queue with options
const dataQueue = new Bull("dataQueue", {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,           // retry 3 times if failed
    backoff: { type: "exponential", delay: 5000 }, // exponential retry delay
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export default dataQueue;
