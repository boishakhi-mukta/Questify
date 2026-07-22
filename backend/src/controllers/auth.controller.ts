/**
 * ============================================================================
 * QUESTIFY CONTROLLER: Auth Controller
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Coordinates user log-ins, session extensions, security updates, and sign-outs.
 * 
 * WHY IT EXISTS:
 * The entryway check point ensuring only authorized users access systems.
 * 
 * HOW IT WORKS (Technical Overview):
 * Queries DB passwords, issues secure tokens, and logs authorization events.
 * ============================================================================
 */

import { Request, Response } from "express";
import { User } from "@/models/User";
import { generateTokenPair, verifyRefreshToken } from "@/utils/jwt";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "@/utils/errors";
import { sendSuccess } from "@/utils/responses";
import { ERROR_CODES } from "@/config/constants";
import { logAuthEvent } from "@/utils/logger";
import type { AuthenticatedRequest } from "@/types";

// ── POST /api/v1/auth/login ────────────────────────────────────────────────────
// Handles someone logging in: checks their email exists, their account isn't
// disabled, and their password is correct — in that order, so we can give a
// specific reason if it fails. On success, hands back the login tokens.
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
// Returns the profile of whoever is currently logged in — used by the
// frontend to know who's signed in and show their name/role/avatar.
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
// Lets a logged-in user change their own password: confirms they know their
// current password, makes sure the new one is actually different, then saves it.
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

// ── POST /api/v1/auth/refresh ─────────────────────────────────────────────────
// Issues a fresh login session using a still-valid refresh token, so a user
// doesn't get logged out just because their short-lived access token expired.
export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken: token } = req.body as { refreshToken: string };

  // verifyRefreshToken throws AuthenticationError or TokenExpiredError on failure
  const payload = verifyRefreshToken(token);

  const user = await User.findById(payload.id);
  if (!user || !user.isActive) {
    throw new AuthenticationError(
      "User no longer exists or has been disabled.",
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  const tokens = generateTokenPair({ id: String(user._id), role: user.role, name: user.fullName });

  logAuthEvent("TOKEN_REFRESH", { userId: String(user._id), ip: req.ip });

  sendSuccess(res, tokens, "Token refreshed successfully");
}

// ── PATCH /api/v1/auth/profile ─────────────────────────────────────────────────
// Lets a logged-in user edit their own profile details (name, avatar, bio,
// contact info) — only the fields they actually send get changed.
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
