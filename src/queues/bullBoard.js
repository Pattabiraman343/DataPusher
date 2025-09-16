// bullBoard.js
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import dataQueue from "./dataQueue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

// Only create Bull Board in non-test environment
if (process.env.NODE_ENV !== "test") {
  createBullBoard({
    queues: [new BullAdapter(dataQueue)],
    serverAdapter,
  });
}

export { serverAdapter as router };
