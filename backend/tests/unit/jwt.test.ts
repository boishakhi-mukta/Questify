import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
} from "@/utils/jwt";
import { AuthenticationError, TokenExpiredError } from "@/utils/errors";
import jwt from "jsonwebtoken";

const PAYLOAD = { id: "user123", role: "student" as const, name: "Alice Smith" };

// ─────────────────────────────────────────────────────────────────────────────
// generateAccessToken
// ─────────────────────────────────────────────────────────────────────────────
describe("generateAccessToken", () => {
  it("returns a non-empty JWT string", () => {
    const token = generateAccessToken(PAYLOAD);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // header.payload.signature
  });

  it("embeds the payload claims", () => {
    const token   = generateAccessToken(PAYLOAD);
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded.id).toBe(PAYLOAD.id);
    expect(decoded.role).toBe(PAYLOAD.role);
    expect(decoded.name).toBe(PAYLOAD.name);
  });

  it("contains exp (expiry) and iat (issued-at) claims", () => {
    const decoded = jwt.decode(generateAccessToken(PAYLOAD)) as Record<string, unknown>;
    expect(typeof decoded.exp).toBe("number");
    expect(typeof decoded.iat).toBe("number");
    expect((decoded.exp as number)).toBeGreaterThan((decoded.iat as number));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// generateRefreshToken
// ─────────────────────────────────────────────────────────────────────────────
describe("generateRefreshToken", () => {
  it("returns a valid JWT distinct from the access token", () => {
    const access  = generateAccessToken(PAYLOAD);
    const refresh = generateRefreshToken(PAYLOAD);
    expect(refresh).not.toBe(access);
    expect(refresh.split(".")).toHaveLength(3);
  });

  it("has a longer expiry than the access token", () => {
    const accessDecoded  = jwt.decode(generateAccessToken(PAYLOAD))  as { exp: number };
    const refreshDecoded = jwt.decode(generateRefreshToken(PAYLOAD)) as { exp: number };
    expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// generateTokenPair
// ─────────────────────────────────────────────────────────────────────────────
describe("generateTokenPair", () => {
  it("returns both accessToken and refreshToken", () => {
    const pair = generateTokenPair(PAYLOAD);
    expect(pair).toHaveProperty("accessToken");
    expect(pair).toHaveProperty("refreshToken");
    expect(pair.accessToken).not.toBe(pair.refreshToken);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// verifyAccessToken
// ─────────────────────────────────────────────────────────────────────────────
describe("verifyAccessToken", () => {
  it("returns the decoded payload for a valid access token", () => {
    const token   = generateAccessToken(PAYLOAD);
    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(PAYLOAD.id);
    expect(decoded.role).toBe(PAYLOAD.role);
  });

  it("throws AuthenticationError for a malformed token", () => {
    expect(() => verifyAccessToken("not.a.jwt")).toThrow(AuthenticationError);
  });

  it("throws AuthenticationError for a token signed with the wrong secret", () => {
    const forged = jwt.sign(PAYLOAD, "wrong-secret");
    expect(() => verifyAccessToken(forged)).toThrow(AuthenticationError);
  });

  it("throws AuthenticationError for an empty string", () => {
    expect(() => verifyAccessToken("")).toThrow(AuthenticationError);
  });

  it("throws TokenExpiredError for a token that has already expired", () => {
    const expired = jwt.sign(PAYLOAD, process.env.JWT_SECRET!, { expiresIn: -1 });
    expect(() => verifyAccessToken(expired)).toThrow(TokenExpiredError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// verifyRefreshToken
// ─────────────────────────────────────────────────────────────────────────────
describe("verifyRefreshToken", () => {
  it("returns the decoded payload for a valid refresh token", () => {
    const token   = generateRefreshToken(PAYLOAD);
    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(PAYLOAD.id);
  });

  it("throws AuthenticationError when an access token is passed instead", () => {
    const accessToken = generateAccessToken(PAYLOAD);
    // Access token is signed with JWT_SECRET, refresh verifier uses JWT_REFRESH_SECRET
    expect(() => verifyRefreshToken(accessToken)).toThrow(AuthenticationError);
  });

  it("throws TokenExpiredError for an expired refresh token", () => {
    const expired = jwt.sign(PAYLOAD, process.env.JWT_REFRESH_SECRET!, { expiresIn: -1 });
    expect(() => verifyRefreshToken(expired)).toThrow(TokenExpiredError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// decodeToken
// ─────────────────────────────────────────────────────────────────────────────
describe("decodeToken", () => {
  it("returns the payload without verifying the signature", () => {
    const forged  = jwt.sign(PAYLOAD, "any-secret");
    const decoded = decodeToken(forged);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(PAYLOAD.id);
  });

  it("returns null for a completely invalid string", () => {
    expect(decodeToken("not-a-jwt-at-all")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(decodeToken("")).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isTokenExpired
// ─────────────────────────────────────────────────────────────────────────────
describe("isTokenExpired", () => {
  it("returns false for a fresh token", () => {
    const token = generateAccessToken(PAYLOAD);
    expect(isTokenExpired(token)).toBe(false);
  });

  it("returns true for a token that expired in the past", () => {
    const expired = jwt.sign(PAYLOAD, process.env.JWT_SECRET!, { expiresIn: -1 });
    expect(isTokenExpired(expired)).toBe(true);
  });

  it("returns true for an undecipherable string", () => {
    expect(isTokenExpired("garbage")).toBe(true);
  });
});
