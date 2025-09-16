import { body, validationResult } from "express-validator";

export const validate = (rules) => async (req, res, next) => {
  await Promise.all(rules.map((rule) => rule.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  next();
};

// Reusable rules
export const accountRules = [
  body("account_name").notEmpty().withMessage("Account name is required"),
  body("website").optional().isURL().withMessage("Website must be a valid URL"),
];

export const memberRules = [
  body("account_id").isInt().withMessage("Valid account_id is required"),
  body("user_id").isInt().withMessage("Valid user_id is required"),
  body("role_id").isInt().withMessage("Valid role_id is required"),
];

export const destinationRules = [
  body("account_id").isInt().withMessage("Valid account_id is required"),
  body("url").isURL().withMessage("URL must be valid"),
  body("method").isIn(["POST", "GET", "PUT", "DELETE"]).withMessage("Invalid method"),
  body("headers").optional().isObject().withMessage("Headers must be an object"),
];
