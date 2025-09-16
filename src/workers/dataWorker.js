// src/workers/dataWorker.js
import dataQueue from "../queues/dataQueue.js";
import { Destination, Log } from "../models/Index.js";
import axios from "axios";
import Bottleneck from "bottleneck";

// Max parallel jobs in Bull queue
const MAX_CONCURRENCY = 5;

// 🔹 Create per-destination limiters
const limiters = {};
const getLimiter = (destinationId) => {
  if (!limiters[destinationId]) {
    limiters[destinationId] = new Bottleneck({
      maxConcurrent: 1,  // only 1 request at a time per destination
      minTime: 1000,     // 1 request per second
    });
  }
  return limiters[destinationId];
};

// Only start worker if NOT in test environment
if (process.env.NODE_ENV !== "test") {
  // Process Bull jobs
  dataQueue.process(MAX_CONCURRENCY, async (job) => {
    const { account_id, received_data, event_id } = job.data;

    try {
      const destinations = await Destination.findAll({ where: { account_id } });

      if (!destinations || destinations.length === 0) {
        console.log(`No destinations for account_id ${account_id}`);
        return { success: true, processed: 0 };
      }

      // Process destinations sequentially respecting rate limits
      await Promise.all(
        destinations.map(async (dest) => {
          const limiter = getLimiter(dest.id);

          await limiter.schedule(async () => {
            try {
              await axios({
                url: dest.url,
                method: dest.method,
                headers:
                  typeof dest.headers === "string"
                    ? JSON.parse(dest.headers)
                    : dest.headers,
                data: received_data,
                timeout: 5000,
              });

              // Log success
              await Log.create({
                event_id,
                account_id,
                destination_id: dest.id,
                received_timestamp: new Date(),
                processed_timestamp: new Date(),
                received_data,
                status: "success",
                error_message: null,
                action: "dispatch",
                entity: "destination",
              });
            } catch (err) {
              // Log failure
              await Log.create({
                event_id,
                account_id,
                destination_id: dest.id,
                received_timestamp: new Date(),
                processed_timestamp: new Date(),
                received_data,
                status: "failed",
                error_message: err.message,
                action: "dispatch",
                entity: "destination",
              });

              throw err; // let Bull handle retry
            }
          });
        })
      );

      return { success: true, processed: destinations.length };
    } catch (err) {
      console.error(`Worker error for event_id ${event_id}:`, err.message);
      throw err; // trigger retry in Bull
    }
  });

  // Bull event listeners
  dataQueue.on("completed", (job) => {
    console.log(`✅ Job completed for event_id ${job.data.event_id}`);
  });

  dataQueue.on("failed", (job, err) => {
    console.error(`❌ Job ${job.id} failed: ${err.message}`);
    if (job.attemptsMade >= 3) {
      console.log(`⚠️ Job ${job.id} failed 3+ times. Notify admin.`);
    }
  });

  dataQueue.on("error", (err) => {
    console.error("Queue error:", err);
  });

  console.log("🚀 Data worker running with concurrency:", MAX_CONCURRENCY);
}
