import rateLimit from "express-rate-limit";

export const incomingDataLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // max 30 requests per minute per IP
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
