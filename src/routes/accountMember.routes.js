import express from "express";
import { addMember, getMembers, removeMember ,searchMembers} from "../controllers/accountMemberController.js";
import { validate, memberRules } from "../middlewares/validate.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorize(["Admin"]), validate(memberRules), addMember);
router.get("/", authenticate,cache("accounts:"), getMembers);
router.delete("/:id", authenticate, cache("accounts:"),authorize(["Admin"]), removeMember);
router.get("/search", authenticate, authorize(["Admin"]), searchMembers);

export default router;
