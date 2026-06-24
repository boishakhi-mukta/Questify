import { Request, Response } from "express";
import { User } from "../models/User";
import { generateAccessToken } from "@/utils/jwt";
import type { UserRole } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
  const { userId, password, role } = req.body as {
    userId: string;
    password: string;
    role: UserRole;
  };

  // Explicitly select password (field has select: false on the schema)
  const user = await User.findOne({ userId, role }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    // Deliberately vague message — don't reveal whether userId or password was wrong
    res.status(401).json({ success: false, message: "Invalid credentials" });
    return;
  }

  const token = generateAccessToken({ id: String(user._id), role: user.role, name: user.name });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ─────────────────────────────────────────────────────────────────────────────
export async function getMe(req: Request, res: Response): Promise<void> {
  // req.user is attached by the protect middleware
  const authReq = req as Request & { user?: { id: string } };
  const user = await User.findById(authReq.user?.id);

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  res.status(200).json({ success: true, message: "OK", data: { user } });
}
