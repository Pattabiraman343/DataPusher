import express from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
  "/signup",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
    body("role_name").notEmpty().withMessage("Role is required"),
  ]),
  signup
);

router.post(
  "/login",
  validate([
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ]),
  login
);

export default router;
