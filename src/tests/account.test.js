import request from "supertest";
import app from "../../server.js";
import { sequelize, Account, Role, User } from "../models/Index.js";
import { closeDb } from "./setup.js";

let token;

describe("Account CRUD", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await Role.bulkCreate([{ role_name: "Admin" }, { role_name: "User" }]);

    // Signup + Login Admin
    await request(app).post("/api/auth/signup").send({
      email: "admin@test.com",
      password: "123456",
      role_name: "Admin",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "123456",
    });

    token = res.body.data.token;
  });

  afterAll(async () => {
    await closeDb();
  });

  it("should create a new account", async () => {
    const res = await request(app)
      .post("/api/accounts")
      .set("Authorization", `Bearer ${token}`)
      .send({ account_name: "Test Account", created_by: 1, updated_by: 1 });

    expect(res.statusCode).toBe(201); // ✅ Corrected
    expect(res.body.success).toBe(true);
    expect(res.body.data.account_name).toBe("Test Account");
  });

  it("should get accounts list", async () => {
    const res = await request(app)
      .get("/api/accounts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
