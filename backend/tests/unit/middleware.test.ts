import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { verifyJWT } from "@/middleware/auth";
import { requireRole } from "@/middleware/rbac";
import { validateRequest } from "@/middleware/validation";
import { ValidationError, AuthorizationError } from "@/utils/errors";
import { generateAccessToken } from "@/utils/jwt";

// ── Helpers ────────────────────────────────────────────────────────────────────
function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockNext(): NextFunction {
  return jest.fn();
}

function mockReq(overrides: Record<string, unknown> = {}): Partial<Request> {
  return { headers: {}, body: {}, ...overrides };
}

// ─────────────────────────────────────────────────────────────────────────────
// verifyJWT
// ─────────────────────────────────────────────────────────────────────────────
describe("verifyJWT", () => {
  const validToken = generateAccessToken({ id: "abc123", role: "student", name: "Alice" });

  it("attaches req.user and calls next() for a valid Bearer token", () => {
    const req = mockReq({ headers: { authorization: `Bearer ${validToken}` } });
    const res = mockRes();
    const next = mockNext();

    verifyJWT(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(); // called with no error
    expect((req as Record<string, unknown>).user).toMatchObject({
      id: "abc123",
      role: "student",
      name: "Alice",
    });
  });

  it("returns 401 when Authorization header is missing", () => {
    const req = mockReq({ headers: {} });
    const res = mockRes();
    const next = mockNext();

    verifyJWT(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when header has wrong scheme (no Bearer prefix)", () => {
    const req = mockReq({ headers: { authorization: `Token ${validToken}` } });
    const res = mockRes();
    const next = mockNext();

    verifyJWT(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("calls next(err) for an invalid token", () => {
    const req = mockReq({ headers: { authorization: "Bearer not.a.real.jwt" } });
    const res = mockRes();
    const next = mockNext();

    verifyJWT(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// requireRole
// ─────────────────────────────────────────────────────────────────────────────
describe("requireRole", () => {
  function reqWithRole(role: string): Partial<Request> {
    return mockReq({ user: { id: "u1", role, name: "Test" } });
  }

  it("calls next() when user has a required role", () => {
    const req = reqWithRole("admin");
    const next = mockNext();
    requireRole("admin")(req as Request, mockRes() as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next() when user matches one of multiple allowed roles", () => {
    const req = reqWithRole("teacher");
    const next = mockNext();
    requireRole("admin", "teacher")(req as Request, mockRes() as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next(AuthorizationError) when role is not allowed", () => {
    const req = reqWithRole("student");
    const next = mockNext();
    requireRole("admin")(req as Request, mockRes() as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });

  it("calls next(AuthorizationError) when req.user is missing", () => {
    const req = mockReq({});
    const next = mockNext();
    requireRole("admin")(req as Request, mockRes() as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateRequest
// ─────────────────────────────────────────────────────────────────────────────
describe("validateRequest", () => {
  const schema = z.object({
    email: z.string().email(),
    age: z.coerce.number().min(18),
  });

  it("calls next() and replaces req.body with parsed data on valid input", () => {
    const req = mockReq({ body: { email: "alice@example.com", age: "25" } });
    const next = mockNext();
    validateRequest(schema)(req as Request, mockRes() as Response, next);

    expect(next).toHaveBeenCalledWith();
    // age was a string "25" — Zod coerces it to number 25
    expect((req as Record<string, unknown>).body).toEqual({
      email: "alice@example.com",
      age: 25,
    });
  });

  it("calls next(ValidationError) with field-level details on invalid input", () => {
    const req = mockReq({ body: { email: "not-an-email", age: 10 } });
    const next = mockNext();
    validateRequest(schema)(req as Request, mockRes() as Response, next);

    const err = (next as jest.Mock).mock.calls[0][0] as ValidationError;
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.details.length).toBeGreaterThan(0);
    expect(err.details.some((d) => d.includes("email"))).toBe(true);
    expect(err.details.some((d) => d.includes("age"))).toBe(true);
  });

  it("calls next(ValidationError) when body is missing entirely", () => {
    const req = mockReq({ body: undefined });
    const next = mockNext();
    validateRequest(schema)(req as Request, mockRes() as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  it("validates req.params when target is 'params'", () => {
    const idSchema = z.object({ id: z.string().length(24) });
    const req = mockReq({ params: { id: "a".repeat(24) } });
    const next = mockNext();
    validateRequest(idSchema, "params")(req as Request, mockRes() as Response, next);
    expect(next).toHaveBeenCalledWith();
  });
});
