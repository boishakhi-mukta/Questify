import request from "supertest";
import app from "@/app";
import { connectTestDB, clearCollections } from "@/tests/setup";
import { disconnectTestDB } from "@/tests/teardown";
import {
  createStudent,
  createAndLogin,
  authHeader,
  TEST_PASSWORD,
} from "@/tests/helpers";

beforeAll(async () => {
  await connectTestDB();
  await clearCollections();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/login", () => {
  it("returns 200 with access + refresh tokens for valid credentials", async () => {
    const user = await createStudent({ email: "login-ok@test.com" });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      accessToken:  expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(res.body.data.user.email).toBe(user.email);
  });

  it("is case-insensitive on email", async () => {
    const user = await createStudent({ email: "case-insensitive@test.com" });
    const res  = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email.toUpperCase(), password: TEST_PASSWORD });

    expect(res.status).toBe(200);
  });

  it("returns 401 when email does not exist", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nobody@test.com", password: TEST_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for the correct email but wrong password", async () => {
    const user = await createStudent({ email: "wrong-pw@test.com" });
    const res  = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: "Wrong@Pass9" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 403 for a disabled account", async () => {
    const user = await createStudent({ email: "disabled@test.com", isActive: false });
    const res  = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCOUNT_DISABLED");
  });

  it("returns 422 for an invalid email format", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email", password: "x" });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("includes requestId in error responses", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nobody@test.com", password: TEST_PASSWORD });

    expect(res.body.error.requestId).toBeDefined();
    expect(typeof res.body.error.requestId).toBe("string");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/auth/me", () => {
  it("returns the authenticated user's profile", async () => {
    const { user, accessToken } = await createAndLogin({ email: "me@test.com" });

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(user.email);
    expect(res.body.data.user.passwordHash).toBeUndefined(); // never exposed
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 for a malformed token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer not.a.jwt");
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/change-password
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/change-password", () => {
  it("changes password successfully and old password no longer works", async () => {
    const email        = "changepw@test.com";
    const newPassword  = "NewSecure@Pass2";
    const { user, accessToken } = await createAndLogin({ email });

    const changeRes = await request(app)
      .post("/api/v1/auth/change-password")
      .set(authHeader(accessToken))
      .send({ currentPassword: TEST_PASSWORD, newPassword });

    expect(changeRes.status).toBe(200);

    // Old password must no longer work
    const oldLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: TEST_PASSWORD });
    expect(oldLoginRes.status).toBe(401);

    // New password must work
    const newLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: newPassword });
    expect(newLoginRes.status).toBe(200);
  });

  it("returns 401 when currentPassword is wrong", async () => {
    const { accessToken } = await createAndLogin({ email: "cpw-wrong@test.com" });

    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .set(authHeader(accessToken))
      .send({ currentPassword: "Wrong@Pass1", newPassword: "NewPass@99" });

    expect(res.status).toBe(401);
  });

  it("returns 422 when newPassword is weak", async () => {
    const { accessToken } = await createAndLogin({ email: "cpw-weak@test.com" });

    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .set(authHeader(accessToken))
      .send({ currentPassword: TEST_PASSWORD, newPassword: "weak" });

    expect(res.status).toBe(422);
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/change-password")
      .send({ currentPassword: TEST_PASSWORD, newPassword: "NewPass@99" });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/auth/logout", () => {
  it("returns 200 for an authenticated user", async () => {
    const { accessToken } = await createAndLogin({ email: "logout@test.com" });
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set(authHeader(accessToken));
    expect(res.status).toBe(200);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/v1/auth/logout");
    expect(res.status).toBe(401);
  });
});
