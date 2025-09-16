// tests/setup.js (or inside each test file)

import sequelize from "../config/db.js"; // your Sequelize instance
import Role from "../models/Role.js";
import User from "../models/User.js";
import Account from "../models/Account.js";
import Destination from "../models/Destination.js";
import Log from "../models/Log.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

let authToken;
let testUser;
let testAccount;
let testDestination;

beforeAll(async () => {
  // 🔹 Sync DB (optional if using test DB)
  await sequelize.sync({ force: true });

  // 🔹 Create a role
  const role = await Role.create({ role_name: "admin" });

  // 🔹 Create a test user with that role
  const password = await bcrypt.hash("password123", 10);
  testUser = await User.create({
    name: "Test User",
    email: "testuser@example.com",
    password: password,
    role_id: role.id,   // link role
  });

  // 🔹 Generate auth token
  authToken = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1h" });

  // 🔹 Create a test account
  testAccount = await Account.create({
    account_name: "Test Account",
    website: "https://example.com",
    created_by: testUser.id,
    updated_by: testUser.id,
  });

  // 🔹 Optional: create a destination
  testDestination = await Destination.create({
    account_id: testAccount.id,
    url: "https://webhook.site/test",
    method: "POST",
    headers: JSON.stringify({ "Content-Type": "application/json" }),
  });
});

afterAll(async () => {
  // 🔹 Cleanup DB in correct order (FK constraints)
  await Log.destroy({ where: {} });
  await Destination.destroy({ where: {} });
  await Account.destroy({ where: {} });
  await User.destroy({ where: {} });
  await Role.destroy({ where: {} });

  // 🔹 Close Sequelize connection
  await sequelize.close();
});

export { authToken, testUser, testAccount, testDestination };
