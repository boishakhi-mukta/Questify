import { Request, Response } from "express";
import { User } from "@/models/User";
import { generateTokenPair } from "@/utils/jwt";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "@/utils/errors";
import { sendSuccess } from "@/utils/responses";
import { ERROR_CODES } from "@/config/constants";
import type { AuthenticatedRequest } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────────

function logAuthEvent(
  event: string,
  details: Record<string, unknown>
): void {
  console.log(
    JSON.stringify({ event, ...details, timestamp: new Date().toISOString() })
  );
}

// ── POST /api/v1/auth/login ────────────────────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  // ── 1. Email lookup ─────────────────────────────────────────────────────────
  // Deliberately separate from the password check so we can give the specific
  // error messages the spec requires. Note: for public-facing LMSes where user
  // enumeration is a concern, collapse these into a single vague error.
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordHash +requiresPasswordChange"
  );

  if (!user) {
    logAuthEvent("LOGIN_FAILED_EMAIL", { email, ip: req.ip });
    throw new AuthenticationError(
      "Email not found.",
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  // ── 2. Account status ────────────────────────────────────────────────────────
  if (!user.isActive) {
    logAuthEvent("LOGIN_FAILED_DISABLED", {
      userId: user._id.toString(),
      email,
      ip: req.ip,
    });
    throw new AuthorizationError(
      "Account has been disabled. Contact your administrator.",
      ERROR_CODES.ACCOUNT_DISABLED
    );
  }

  // ── 3. Password verification ─────────────────────────────────────────────────
  const passwordOk = await user.comparePassword(password);
  if (!passwordOk) {
    logAuthEvent("LOGIN_FAILED_PASSWORD", {
      userId: user._id.toString(),
      email,
      ip: req.ip,
    });
    throw new AuthenticationError(
      "Invalid password.",
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  // ── 4. Success ───────────────────────────────────────────────────────────────
  user.lastLogin = new Date();
  await user.save({ validateModifiedOnly: true });

  const tokens = generateTokenPair({
    id: String(user._id),
    role: user.role,
    name: user.fullName,
  });

  logAuthEvent("LOGIN_SUCCESS", {
    userId: user._id.toString(),
    email,
    role: user.role,
    ip: req.ip,
  });

  sendSuccess(
    res,
    { ...tokens, user, requiresPasswordChange: user.requiresPasswordChange ?? false },
    "Login successful"
  );
}

// ── POST /api/v1/auth/logout ───────────────────────────────────────────────────
/**
 * Stateless JWT — the client is responsible for discarding tokens.
 * Extend with a Redis blocklist when short-lived token revocation is needed.
 */
export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  logAuthEvent("LOGOUT", { userId: req.user?.id, ip: req.ip });
  sendSuccess(res, null, "Logged out successfully");
}

// ── GET /api/v1/auth/me ────────────────────────────────────────────────────────
export async function getMe(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const user = await User.findById(req.user?.id);
  if (!user) throw new NotFoundError("User");

  // toJSON transform already strips passwordHash
  sendSuccess(res, { user }, "User retrieved successfully");
}

// ── POST /api/v1/auth/change-password ─────────────────────────────────────────
export async function changePassword(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  // Fetch with passwordHash (select: false by default)
  const user = await User.findById(req.user!.id).select("+passwordHash");
  if (!user) throw new NotFoundError("User");

  // ── Verify current password ──────────────────────────────────────────────────
  const isCurrentValid = await user.comparePassword(currentPassword);
  if (!isCurrentValid) {
    logAuthEvent("CHANGE_PASSWORD_FAILED", {
      userId: req.user!.id,
      reason: "wrong_current_password",
      ip: req.ip,
    });
    throw new AuthenticationError(
      "Current password is incorrect.",
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  // ── Guard: must be a different password ─────────────────────────────────────
  // Zod already rejects currentPassword === newPassword at the route level,
  // but we double-check at the hash level to handle any bypass attempts.
  const isSameHash = await user.comparePassword(newPassword);
  if (isSameHash) {
    throw new AuthenticationError(
      "New password must be different from your current password.",
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // ── Update ───────────────────────────────────────────────────────────────────
  user.passwordHash           = newPassword;  // pre-save hook hashes
  user.requiresPasswordChange = false;        // clear temp-password flag
  await user.save({ validateModifiedOnly: true });

  logAuthEvent("CHANGE_PASSWORD_SUCCESS", {
    userId: req.user!.id,
    ip: req.ip,
  });

  // Note: we cannot invalidate existing JWTs without a token blocklist.
  // Advise the client to clear stored tokens so other sessions log out naturally.
  sendSuccess(
    res,
    { note: "All other active sessions will expire at their natural token expiry." },
    "Password changed successfully"
  );
}

// ── PATCH /api/v1/auth/profile ─────────────────────────────────────────────────
export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { firstName, lastName, avatar, profile } = req.body as {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    profile?: {
      bio?: string;
      location?: string;
      phone?: string;
      educationLevel?: string;
      socialLinks?: string[];
    };
  };

  const user = await User.findById(req.user?.id);
  if (!user) throw new NotFoundError("User");

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined)  user.lastName  = lastName;
  if (avatar !== undefined)    user.avatar    = avatar;

  if (profile) {
    if (profile.bio !== undefined)            user.profile.bio = profile.bio;
    if (profile.location !== undefined)       user.profile.location = profile.location;
    if (profile.phone !== undefined)          user.profile.phone = profile.phone;
    if (profile.educationLevel !== undefined) user.profile.educationLevel = profile.educationLevel;
    if (profile.socialLinks !== undefined)    user.profile.socialLinks = profile.socialLinks;
  }

  await user.save({ validateModifiedOnly: true });

  sendSuccess(res, { user }, "Profile updated successfully");
}
