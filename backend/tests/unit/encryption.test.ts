import {
  hashPassword,
  comparePassword,
  generateResetToken,
  verifyResetToken,
  generateSecureToken,
} from "@/utils/encryption";

// ─────────────────────────────────────────────────────────────────────────────
// hashPassword / comparePassword
// ─────────────────────────────────────────────────────────────────────────────
describe("hashPassword", () => {
  it("produces a bcrypt hash (starts with $2b$)", async () => {
    const hash = await hashPassword("MyP@ssw0rd");
    expect(hash).toMatch(/^\$2[ab]\$/);
  });

  it("produces a different hash every call (unique salts)", async () => {
    const h1 = await hashPassword("SamePass@1");
    const h2 = await hashPassword("SamePass@1");
    expect(h1).not.toBe(h2);
  });

  it("does NOT store the plain-text password", async () => {
    const hash = await hashPassword("Secret@99");
    expect(hash).not.toContain("Secret@99");
  });
});

describe("comparePassword", () => {
  it("returns true for the correct plain-text password", async () => {
    const plain = "Correct@Pass1";
    const hash  = await hashPassword(plain);
    expect(await comparePassword(plain, hash)).toBe(true);
  });

  it("returns false for the wrong password", async () => {
    const hash = await hashPassword("Right@Pass1");
    expect(await comparePassword("Wrong@Pass1", hash)).toBe(false);
  });

  it("returns false for an empty string", async () => {
    const hash = await hashPassword("Secure@Pass1");
    expect(await comparePassword("", hash)).toBe(false);
  });

  it("is case-sensitive", async () => {
    const hash = await hashPassword("Password@1");
    expect(await comparePassword("password@1", hash)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// generateResetToken / verifyResetToken
// ─────────────────────────────────────────────────────────────────────────────
describe("generateResetToken", () => {
  it("returns a raw token, its SHA-256 hash, and an expiry date", () => {
    const { token, hashedToken, expiresAt } = generateResetToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBe(64); // 32 bytes → 64 hex chars
    expect(hashedToken.length).toBe(64);
    expect(token).not.toBe(hashedToken);
    expect(expiresAt).toBeInstanceOf(Date);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("generates unique tokens on each call", () => {
    const t1 = generateResetToken();
    const t2 = generateResetToken();
    expect(t1.token).not.toBe(t2.token);
    expect(t1.hashedToken).not.toBe(t2.hashedToken);
  });

  it("respects a custom expiry duration", () => {
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const { expiresAt } = generateResetToken(twoHoursMs);
    const diff = expiresAt.getTime() - Date.now();
    // Allow ±1 second of drift
    expect(diff).toBeGreaterThan(twoHoursMs - 1_000);
    expect(diff).toBeLessThanOrEqual(twoHoursMs + 1_000);
  });
});

describe("verifyResetToken", () => {
  it("returns true when the raw token matches the stored hash", () => {
    const { token, hashedToken } = generateResetToken();
    expect(verifyResetToken(token, hashedToken)).toBe(true);
  });

  it("returns false for a tampered raw token", () => {
    const { hashedToken } = generateResetToken();
    expect(verifyResetToken("tampered-token", hashedToken)).toBe(false);
  });

  it("returns false when compared against the wrong hash", () => {
    const { token }        = generateResetToken();
    const { hashedToken }  = generateResetToken(); // different token
    expect(verifyResetToken(token, hashedToken)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// generateSecureToken
// ─────────────────────────────────────────────────────────────────────────────
describe("generateSecureToken", () => {
  it("returns a hex string of length bytes * 2 (default 32 bytes → 64 chars)", () => {
    const token = generateSecureToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it("respects a custom byte length", () => {
    expect(generateSecureToken(16)).toHaveLength(32);
    expect(generateSecureToken(8)).toHaveLength(16);
  });

  it("generates unique tokens on each call", () => {
    const t1 = generateSecureToken();
    const t2 = generateSecureToken();
    expect(t1).not.toBe(t2);
  });
});
