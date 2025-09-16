// src/tests/destination.test.js
import request from "supertest";
import app from "../../server.js";
import { sequelize, Role } from "../models/Index.js";

let authToken;
let accountId;
let destinationId;

beforeAll(async () => {
  // Reset DB
  await sequelize.sync({ force: true });

  // Create role
  await Role.create({ role_name: "Admin" });

  // Create user
  const userRes = await request(app)
    .post("/api/auth/signup")
    .send({
      email: "dest@test.com",
      password: "password123",
      role_name: "Admin",
    });

  expect(userRes.body.success).toBe(true);

  // Login
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "dest@test.com",
      password: "password123",
    });

  expect(loginRes.body.success).toBe(true);
  authToken = loginRes.body.data.token;

  // Create account
  const accountRes = await request(app)
    .post("/api/accounts")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      account_name: "Destination Test Account",
      website: "https://example.com",
    });

  expect(accountRes.statusCode).toBe(201);
  accountId = accountRes.body.data.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe("Destination CRUD", () => {
  test("should create a destination", async () => {
    const res = await request(app)
      .post("/api/destinations")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        account_id: accountId,
        url: "https://webhook.site/original",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");

    destinationId = res.body.data.id;
  });

  test("should get all destinations", async () => {
    const res = await request(app)
      .get("/api/destinations")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test("should update a destination", async () => {
    const res = await request(app)
      .put(`/api/destinations/${destinationId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        // ✅ send full payload to avoid validation issues
        account_id: accountId,
        url: "https://webhook.site/updated",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe("https://webhook.site/updated");
  });

  test("should delete a destination", async () => {
    const res = await request(app)
      .delete(`/api/destinations/${destinationId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
