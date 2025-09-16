import request from "supertest";
import app from "../../server.js";
import { sequelize, Account, User, Destination } from "../models/Index.js";

let testAccount;
const validToken = "734261485c9493bef9b15edf33db851943c42ee0e3c12f46fee1acfb4aff0b6a";

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const testUser = await User.create({
    username: "test_user",
    email: "test@example.com",
    password: "password123",
  });

  // Create account with app secret token
  testAccount = await Account.create({
    account_name: "Test Account",
    app_secret_token: validToken,
    created_by: testUser.id,
    updated_by: testUser.id,
  });

  // ✅ Create a valid destination for this account
  await Destination.create({
    account_id: testAccount.id,
    name: "Test Destination",
    url: "http://example.com/webhook",
    method: "POST",
    headers: {},
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe("POST /server/incoming_data", () => {
  it("returns 400 if CL-X-TOKEN header is missing", async () => {
    const res = await request(app).post("/server/incoming_data").send({
      user: "John Doe",
      email: "john@example.com",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/CL-X-TOKEN/i);
  });

  it("returns 401 if CL-X-TOKEN is invalid", async () => {
    const res = await request(app)
      .post("/server/incoming_data")
      .set("CL-X-TOKEN", "wrong-token")
      .send({
        user: "John Doe",
        email: "john@example.com",
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("returns 400 if body is empty", async () => {
    const res = await request(app)
      .post("/server/incoming_data")
      .set("CL-X-TOKEN", validToken)
      .send({});
  
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Validation error: "user" is required/i);
  });
  

  it("returns 200 and queues data successfully", async () => {
    const payload = { user: "John Doe", email: "john@example.com" };

    const res = await request(app)
      .post("/server/incoming_data")
      .set("CL-X-TOKEN", validToken)
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/queued/i);
  });
});
