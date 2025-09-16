import express from "express";
import { createAccount, updateAccount, getAccounts, getAccountById, deleteAccount, searchAccounts } from "../controllers/account.controller.js";
import { validate, accountRules } from "../middlewares/validate.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorize(["Admin"]), validate(accountRules), createAccount);
router.put("/:id", authenticate, authorize(["Admin"]), validate(accountRules), updateAccount);
router.get("/", authenticate,cache("accounts:"), getAccounts);
router.get("/:id", authenticate,cache("accounts:"), getAccountById);
router.delete("/:id", authenticate, authorize(["Admin"]), deleteAccount);

// ✅ New search route
router.get("/search", authenticate, searchAccounts);

export default router;
