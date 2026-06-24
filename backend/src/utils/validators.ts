import { Types } from "mongoose";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const ok = (): ValidationResult => ({ valid: true, errors: [] });
const fail = (...errors: string[]): ValidationResult => ({ valid: false, errors });

// ── Email ──────────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  if (!email || typeof email !== "string") errors.push("Email is required.");
  else if (email.length > 254) errors.push("Email must be at most 254 characters.");
  else if (!EMAIL_RE.test(email)) errors.push("Email address is invalid.");
  return errors.length ? { valid: false, errors } : ok();
}

// ── Password ───────────────────────────────────────────────────────────────────
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  if (!password) {
    return fail("Password is required.");
  }
  if (password.length < 8) errors.push("Password must be at least 8 characters.");
  if (password.length > 128) errors.push("Password must be at most 128 characters.");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter.");
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter.");
  if (!/\d/.test(password)) errors.push("Password must contain at least one number.");
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    errors.push("Password must contain at least one special character.");
  return errors.length ? { valid: false, errors } : ok();
}

// ── Phone number ───────────────────────────────────────────────────────────────
// E.164 format: +[country code][number], 8–15 digits
const PHONE_RE = /^\+?[1-9]\d{7,14}$/;

export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone) return fail("Phone number is required.");
  const digits = phone.replace(/[\s\-().]/g, "");
  if (!PHONE_RE.test(digits)) return fail("Phone number is invalid. Expected format: +1234567890.");
  return ok();
}

// ── URL ────────────────────────────────────────────────────────────────────────
export function validateUrl(url: string): ValidationResult {
  if (!url) return fail("URL is required.");
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return fail("URL must use http or https protocol.");
    }
    return ok();
  } catch {
    return fail("URL is invalid.");
  }
}

// ── Course title ───────────────────────────────────────────────────────────────
export function validateCourseTitle(title: string): ValidationResult {
  const errors: string[] = [];
  if (!title) return fail("Course title is required.");
  if (title.trim().length < 3) errors.push("Course title must be at least 3 characters.");
  if (title.length > 200) errors.push("Course title must be at most 200 characters.");
  if (/[<>{}[\]]/.test(title)) errors.push("Course title contains invalid characters.");
  return errors.length ? { valid: false, errors } : ok();
}

// ── userId (alphanumeric + underscore/hyphen) ──────────────────────────────────
const USER_ID_RE = /^[a-zA-Z0-9_-]+$/;

export function validateUserId(userId: string): ValidationResult {
  const errors: string[] = [];
  if (!userId) return fail("User ID is required.");
  if (userId.length < 3) errors.push("User ID must be at least 3 characters.");
  if (userId.length > 30) errors.push("User ID must be at most 30 characters.");
  if (!USER_ID_RE.test(userId))
    errors.push("User ID may only contain letters, numbers, underscores and hyphens.");
  return errors.length ? { valid: false, errors } : ok();
}

// ── MongoDB ObjectId ───────────────────────────────────────────────────────────
export function validateObjectId(id: string): ValidationResult {
  if (!id) return fail("ID is required.");
  if (!Types.ObjectId.isValid(id)) return fail(`"${id}" is not a valid ID.`);
  return ok();
}

// ── Combine multiple results ───────────────────────────────────────────────────
export function combineResults(...results: ValidationResult[]): ValidationResult {
  const errors = results.flatMap((r) => r.errors);
  return { valid: errors.length === 0, errors };
}
