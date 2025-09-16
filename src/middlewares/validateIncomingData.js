import Joi from "joi";

const incomingDataSchema = Joi.object({
  user: Joi.string().required(),
  email: Joi.string().email().required(),
  // Add other expected fields here
});

export const validateIncomingData = (req, res, next) => {
  const { error } = incomingDataSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error: " + error.details[0].message,
    });
  }
  next();
};
