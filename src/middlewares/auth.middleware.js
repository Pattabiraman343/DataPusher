import jwt from "jsonwebtoken";
import { User, Role } from "../models/Index.js";

// Authenticate user
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ success: false, message: "Invalid token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { include: Role });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Unauthorized", error: err.message });
  }
};

// Role-based Authorization
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.Role.role_name)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient role" });
    }
    next();
  };
};
