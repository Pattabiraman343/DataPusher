import { sequelize, Role, User, Account, Destination } from "../models/Index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

let authToken, testUser, testAccount, testDestination;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const role = await Role.create({ role_name: "Admin" });

  const password = await bcrypt.hash("password123", 10);
  testUser = await User.create({
    name: "Test User",
    email: "testuser@example.com",
    password,
    role_id: role.id,
  });

  authToken = jwt.sign({ id: testUser.id, role: "Admin" }, process.env.JWT_SECRET || "secretkey", {
    expiresIn: "1h",
  });

  testAccount = await Account.create({
    account_name: "Test Account",
    website: "https://example.com",
    created_by: testUser.id,
    updated_by: testUser.id,
  });

  testDestination = await Destination.create({
    account_id: testAccount.id,
    url: "https://webhook.site/test",
    method: "POST",
    headers: JSON.stringify({ "Content-Type": "application/json" }),
  });
});

export { authToken, testUser, testAccount, testDestination };
