// src/queues/bullBoard.js
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express"; // new adapter
import dataQueue from "./dataQueue.js";

// Create Express adapter
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

// Create Bull Board
createBullBoard({
  queues: [new BullAdapter(dataQueue)],
  serverAdapter,
});

// Export router to mount in server.js
export { serverAdapter as router };
