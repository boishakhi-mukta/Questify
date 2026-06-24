import { Request, Response } from "express";
import { User } from "@/models/User";
import { generateTokenPair } from "@/utils/jwt";
import { AuthenticationError, ConflictError, NotFoundError } from "@/utils/errors";
import { sendSuccess, sendCreated } from "@/utils/responses";
import { ERROR_CODES } from "@/config/constants";
import type { AuthenticatedRequest } from "@/types";

// ── POST /api/v1/auth/register ─────────────────────────────────────────────────
export async function register(req: Request, res: Response): Promise<void> {
  const { email, firstName, lastName, password, avatar } = req.body as {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    avatar?: string;
  };

  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) {
    throw new ConflictError(
      "An account with this email already exists.",
      ERROR_CODES.ALREADY_EXISTS
    );
  }

  const user = await User.create({
    email,
    firstName,
    lastName,
    passwordHash: password, // User pre-save hook hashes this before writing
    role: "student",
    ...(avatar ? { avatar } : {}),
  });

  const tokens = generateTokenPair({
    id: String(user._id),
    role: user.role,
    name: user.fullName,
  });

  sendCreated(res, { ...tokens, user }, "Account created successfully");
}

// ── POST /api/v1/auth/login ────────────────────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  // Explicitly select passwordHash (select: false on the schema by default)
  const user = await User.findOne({
    email: email.toLowerCase(),
    isActive: true,
  }).select("+passwordHash");

  if (!user || !(await user.comparePassword(password))) {
    // Deliberately vague — never reveal which field failed
    throw new AuthenticationError(
      "Invalid email or password.",
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  user.lastLogin = new Date();
  await user.save({ validateModifiedOnly: true });

  const tokens = generateTokenPair({
    id: String(user._id),
    role: user.role,
    name: user.fullName,
  });

  sendSuccess(res, { ...tokens, user }, "Login successful");
}

// ── POST /api/v1/auth/logout ───────────────────────────────────────────────────
export async function logout(_req: Request, res: Response): Promise<void> {
  // Stateless JWT — client is responsible for discarding tokens.
  // Extend here with a Redis blocklist when short-lived token revocation is needed.
  sendSuccess(res, null, "Logged out successfully");
}

// ── GET /api/v1/auth/me ────────────────────────────────────────────────────────
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user?.id);
  if (!user) throw new NotFoundError("User");

  // toJSON transform already strips passwordHash
  sendSuccess(res, { user }, "User retrieved successfully");
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
  if (lastName !== undefined) user.lastName = lastName;
  if (avatar !== undefined) user.avatar = avatar;

  if (profile) {
    if (profile.bio !== undefined) user.profile.bio = profile.bio;
    if (profile.location !== undefined) user.profile.location = profile.location;
    if (profile.phone !== undefined) user.profile.phone = profile.phone;
    if (profile.educationLevel !== undefined)
      user.profile.educationLevel = profile.educationLevel;
    if (profile.socialLinks !== undefined)
      user.profile.socialLinks = profile.socialLinks;
  }

  await user.save({ validateModifiedOnly: true });

  sendSuccess(res, { user }, "Profile updated successfully");
}
