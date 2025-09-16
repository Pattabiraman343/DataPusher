// src/tests/account.test.js
import request from "supertest";
import app from "../../server.js";
import { sequelize, User, Role, Account } from "../models/Index.js";

let authToken;

beforeAll(async () => {
  // 🔹 Sync DB
  await sequelize.sync({ force: true });

  // 🔹 Create a Role
  await Role.create({ role_name: "Admin" });

  // 🔹 Create a test user
  const userRes = await request(app)
    .post("/api/auth/signup")
    .send({
      email: "raman@test.com",
      password: "password123",
      role_name: "Admin",
    });

  expect(userRes.body.success).toBe(true);

  // 🔹 Login to get token
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "raman@test.com",
      password: "password123",
    });

  expect(loginRes.body.success).toBe(true);
  authToken = loginRes.body.data.token;
});

afterAll(async () => {
  // Close DB connection to prevent Jest open handles
  await sequelize.close();
});

describe("Account CRUD", () => {
  let accountId;

  test("should create a new account", async () => {
    const res = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        account_name: "Test Account",
        website: "https://example.com",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");

    accountId = res.body.data.id;
  });

  test("should get accounts list", async () => {
    const res = await request(app)
      .get("/api/accounts")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test("should update an account", async () => {
    const res = await request(app)
      .put(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ account_name: "Updated Account" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.account_name).toBe("Updated Account");
  });

  test("should delete an account", async () => {
    const res = await request(app)
      .delete(`/api/accounts/${accountId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
