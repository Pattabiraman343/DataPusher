// src/tests/auth.test.js
import request from "supertest";
import app from "../../server.js";
import { sequelize, User, Role } from "../models/Index.js";

beforeAll(async () => {
  // Reset DB
  await sequelize.sync({ force: true });

  // Seed roles
  await Role.bulkCreate([
    { role_name: "Admin" },
    { role_name: "User" },
  ]);
});

afterAll(async () => {
  await sequelize.close();
});

describe("Auth Routes", () => {
  let token;

  test("should signup a new Admin user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "admin@test.com",
        password: "123456",
        role_name: "Admin",
      });

    expect(res.statusCode).toBe(201);  // Must match your controller response
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("admin@test.com");
    expect(res.body.data.token).toBeDefined();
  });

  test("should login an existing user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@test.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();

    token = res.body.data.token;
    global.token = token; // make it available for Account tests
  });
});
