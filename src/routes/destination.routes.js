import express from "express";
import { createDestination, getDestinations, getDestinationById, updateDestination, deleteDestination,searchDestinations } from "../controllers/destination.controller.js";
import { validate, destinationRules } from "../middlewares/validate.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";

const router = express.Router();

router.post("/", authenticate, validate(destinationRules), createDestination);
router.put("/:id", authenticate, validate(destinationRules), updateDestination);
router.get("/", authenticate, cache("accounts:"), getDestinations);
router.get("/:id", authenticate, cache("accounts:"),getDestinationById);
router.delete("/:id", authenticate, authorize(["Admin"]), deleteDestination);
router.get("/search", authenticate,cache("accounts:"), searchDestinations);

export default router;
