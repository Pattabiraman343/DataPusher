// server.js
import express from "express";
import dotenv from "dotenv";
import { sequelize, Role } from "./src/models/Index.js";
import authRoutes from "./src/routes/auth.routes.js";
import { authenticate, authorize } from "./src/middlewares/auth.middleware.js";
import accountRoutes from "./src/routes/account.routes.js";
import destinationRoutes from "./src/routes/destination.routes.js";
import accountMemberRoutes from "./src/routes/accountMember.routes.js";
import logRoutes from "./src/routes/log.routes.js";
import incomingDataRoutes from "./src/routes/incoming.routes.js";
import "./src/workers/dataWorker.js"; // start the worker
import { handleIncomingData } from "./src/controllers/incomingData.controller.js";
import { validateIncomingData } from "./src/middlewares/validateIncomingData.js";
import { incomingDataLimiter } from "./src/middlewares/rateLimit.middleware.js";
import { router as bullBoardRouter } from "./src/queues/bullBoard.js";
import { perAccountLimiterMiddleware } from './src/middlewares/accountRateLimiter.js';
import { errorHandler } from "./src/middlewares/errorHandler.js";

dotenv.config();
const app = express();
app.use(express.json());

// Bull Board Dashboard
app.use(
  "/admin/queues",
  authenticate,
  authorize(["Admin"]),
  bullBoardRouter.getRouter()
);
// Incoming data (webhook)
app.post(
  '/server/incoming_data',
  perAccountLimiterMiddleware,
  incomingDataLimiter,
  validateIncomingData,
  handleIncomingData
);
app.use(errorHandler);

// Authenticated routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", authenticate, accountRoutes);
app.use("/api/destinations", authenticate, destinationRoutes);
app.use("/api/members", authenticate, authorize(["Admin"]), accountMemberRoutes);
app.use("/api/logs", logRoutes);
app.use("/api", incomingDataRoutes);

// Export app for tests
export default app;

// Start server only if not in test mode
if (process.env.NODE_ENV !== "test") {
  const startServer = async () => {
    try {
      await sequelize.sync(); // safe for production
      console.log("Database synced ✅");

      // Seed roles
      const roles = ["Admin", "User"];
      for (let r of roles) {
        await Role.findOrCreate({ where: { role_name: r } });
      }
      console.log("✅ Roles seeded");

      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (err) {
      console.error("Error starting server:", err);
    }
  };

  startServer();
}
// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down server...");
  await sequelize.close();
  console.log("Database connection closed");

  // Close Redis / Bull queues if needed
  import("../src/queues/dataQueue.js").then(({ default: dataQueue }) => {
    dataQueue.close().then(() => console.log("Queue closed"));
  });

  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
