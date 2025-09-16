// src/controllers/incomingController.js
import { Account, Destination } from "../models/Index.js";
import dataQueue from "../queues/dataQueue.js";
import { v4 as uuidv4 } from "uuid";
import Redis from "ioredis";

// Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD || undefined,
});

// 🔹 Utility: fetch destinations with caching
const getDestinationsForAccount = async (accountId) => {
  const key = `account:${accountId}:destinations`;
  const cached = await redis.get(key);
  if (cached) {
    console.log("✅ Cache hit for destinations");
    return JSON.parse(cached);
  }

  const destinations = await Destination.findAll({ where: { account_id: accountId } });
  await redis.set(key, JSON.stringify(destinations), "EX", 60); // cache 60s
  return destinations;
};

// POST /server/incoming_data
export const handleIncomingData = async (req, res) => {
  try {
    const token = req.headers["cl-x-token"];
    const event_id = req.headers["cl-x-event-id"] || uuidv4();

    if (!token) {
      return res.status(400).json({ success: false, message: "Missing CL-X-TOKEN header" });
    }

    const account = await Account.findOne({ where: { app_secret_token: token } });
    if (!account) {
      return res.status(401).json({ success: false, message: "Invalid CL-X-TOKEN" });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Request body cannot be empty" });
    }

    const destinations = await getDestinationsForAccount(account.id);
    if (!destinations || destinations.length === 0) {
      return res.status(404).json({ success: false, message: "No destinations found for this account" });
    }

    // Add job to queue with retry & backoff
    await dataQueue.add(
      {
        account_id: account.id,
        received_data: req.body,
        event_id,
      },
      {
        attempts: 5,
        backoff: { type: "exponential", delay: 1000 },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Data received and queued for destinations",
      event_id,
    });
  } catch (err) {
    console.error("Error in incoming_data:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};
export const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findByPk(req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });

    res.json({ success: true, destination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};