import express from "express";
import { handleIncomingData } from "../controllers/incomingData.controller.js";

const router = express.Router();

router.post("/", handleIncomingData);

export default router;
