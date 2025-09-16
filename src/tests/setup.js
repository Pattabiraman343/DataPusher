import { sequelize } from "../models/Index.js";
import Redis from "ioredis";

// Mock Redis
export const redisClient = new Redis();
jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue(null),
    quit: jest.fn().mockResolvedValue(null),
  }));
});

// Mock Bull Queue
jest.mock("../queues/dataQueue.js", () => ({
  default: { add: jest.fn(), process: jest.fn(), on: jest.fn() },
}));

// Close DB connection after all tests
export const closeDb = async () => {
  await sequelize.close();
};
