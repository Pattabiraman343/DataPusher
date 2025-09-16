import express from "express";
import { getLogs,searchLogs } from "../controllers/log.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";

const router = express.Router();

// Admin can view all logs
router.get("/", authenticate,  cache("accounts:"),authorize(["Admin"]), getLogs);
router.get("/search", authenticate,  cache("accounts:"),authorize(["Admin"]), searchLogs);

export default router;
