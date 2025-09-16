import { User, Role } from "../models/Index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createLog } from "./log.controller.js";

export const signup = async (req, res) => {
  try {
    const { email, password, role_name } = req.body;

    const role = await Role.findOne({ where: { role_name } });
    if (!role) return res.status(400).json({ success: false, message: "Invalid role" });

    const user = await User.create({
      email,
      password,
      role_id: role.id
    });

    // Log the signup action
    await createLog(user.id, "CREATE", "User", user.id, { email: user.email });

    res.json({
      success: true,
      message: "Signup successful",
      user: {
        id: user.id,
        email: user.email,
        role: role.role_name
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }, include: Role });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.Role.role_name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Log the login action
    await createLog(user.id, "LOGIN", "User", user.id, { email: user.email });

    res.json({ success: true, message: "Login successful", token, role: user.Role.role_name });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
