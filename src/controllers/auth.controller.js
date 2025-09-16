import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Role } from "../models/Index.js";

// Helper: generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role_name },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Signup
export const signup = async (req, res) => {
  try {
    const { email, password, role_name } = req.body;

    const role = await Role.findOne({ where: { role_name } });
    if (!role) return res.status(400).json({ success: false, message: "Invalid role" });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: "User already exists" });

    // Hash password (single hash)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role_id: role.id,
    });

    const token = generateToken({ id: newUser.id, email: newUser.email, role_name: role.role_name });

    return res.status(201).json({
      success: true,
      data: { id: newUser.id, email: newUser.email, role_name: role.role_name, token },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, attributes: ["role_name"] }],
    });

    if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const token = generateToken({ id: user.id, email: user.email, role_name: user.Role.role_name });

    return res.status(200).json({
      success: true,
      data: { id: user.id, email: user.email, role_name: user.Role.role_name, token },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
