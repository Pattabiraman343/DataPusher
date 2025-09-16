// src/tests/auth.test.js
import request from "supertest";
import app from "../../server.js";
import { sequelize, Role, User } from "../models/Index.js";

let token;

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
  test("should signup a new Admin user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "admin@test.com",
        password: "123456",
        role_name: "Admin",
      });

    expect(res.statusCode).toBe(201);  // Match your controller
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

    if (!res.body.data?.token) console.log("Login failed:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();

    token = res.body.data.token;
    global.token = token; // make token available to other tests
  });
});

export { token };
