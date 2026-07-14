/**
 * ============================================================================
 * QUESTIFY CONTROLLER: Legacy Auth Controller
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Older authentication functions kept for reference.
 * 
 * WHY IT EXISTS:
 * Preserved for system stability checks.
 * 
 * HOW IT WORKS (Technical Overview):
 * Traditional login/register endpoint actions.
 * ============================================================================
 */

import { Request, Response } from "express";
import { User } from "@/models/User";
import { generateTokenPair } from "@/utils/jwt";
import { AuthenticationError } from "@/utils/errors";
import type { AuthenticatedRequest, LoginBody, RegisterBody } from "@/types";

// ── POST /api/v1/auth/register ────────────────────────────────────────────────
export async function register(req: Request, res: Response): Promise<void> {
  const { email, firstName, lastName, password, role, avatar } =
    req.body as RegisterBody;

  const user = await User.create({
    email,
    firstName,
    lastName,
    passwordHash: password, // pre-save hook hashes this before writing to DB
    role: role ?? "student",
    avatar,
  });

  const { accessToken, refreshToken } = generateTokenPair({
    id: String(user._id),
    role: user.role,
    name: user.fullName,
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { accessToken, refreshToken, user },
  });
}

// ── POST /api/v1/auth/login ───────────────────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginBody;

  // Explicitly select passwordHash (select: false on the schema)
  const user = await User.findOne({ email, isActive: true }).select(
    "+passwordHash"
  );

  if (!user || !(await user.comparePassword(password))) {
    // Deliberately vague — don't reveal which field was wrong
    throw new AuthenticationError("Invalid email or password.");
  }

  // Stamp last login
  user.lastLogin = new Date();
  await user.save({ validateModifiedOnly: true });

  const { accessToken, refreshToken } = generateTokenPair({
    id: String(user._id),
    role: user.role,
    name: user.fullName,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { accessToken, refreshToken, user },
  });
}

// ── GET /api/v1/auth/me ───────────────────────────────────────────────────────
export async function getMe(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const user = await User.findById(req.user?.id);

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  res.status(200).json({ success: true, message: "OK", data: { user } });
}

// ── POST /api/v1/auth/logout ──────────────────────────────────────────────────
export async function logout(_req: Request, res: Response): Promise<void> {
  // Stateless JWT — client discards tokens; server-side blocklist not in scope
  res.status(200).json({ success: true, message: "Logged out successfully" });
}
