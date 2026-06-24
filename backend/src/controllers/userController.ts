import { Request, Response } from "express";
import { User } from "../models/User";
import type { AuthenticatedRequest, UserRole } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users          Admin: all users  |  Teacher: students in their courses
// ─────────────────────────────────────────────────────────────────────────────
export async function getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { role: filterRole, search, page = "1", limit = "20" } = req.query as Record<string, string>;

  const query: Record<string, unknown> = {};

  // Non-admins can only view students
  if (req.user?.role !== "admin") {
    query.role = "student";
  } else if (filterRole && ["teacher", "student"].includes(filterRole)) {
    query.role = filterRole;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { userId: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    message: "OK",
    data: { users },
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/:id
// ─────────────────────────────────────────────────────────────────────────────
export async function getUserById(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  res.status(200).json({ success: true, message: "OK", data: { user } });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users         Admin only
// ─────────────────────────────────────────────────────────────────────────────
export async function createUser(req: Request, res: Response): Promise<void> {
  const { userId, name, email, password, role } = req.body as {
    userId: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
  };

  // Admins cannot be created through this endpoint — only via DB seeding
  if (role === "admin") {
    res.status(403).json({ success: false, message: "Admin accounts cannot be created via the API" });
    return;
  }

  const user = await User.create({ userId, name, email, password, role });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { user },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/:id      Admin only
// ─────────────────────────────────────────────────────────────────────────────
export async function updateUser(req: Request, res: Response): Promise<void> {
  // Prevent role escalation to admin and prevent direct password update
  // (password changes should have a dedicated endpoint with old-password verification)
  const { password: _pw, role, ...safeFields } = req.body as Record<string, unknown>;

  if (role === "admin") {
    res.status(403).json({ success: false, message: "Cannot change a user's role to admin" });
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...safeFields, ...(role ? { role } : {}) },
    { new: true, runValidators: true }
  );

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  res.status(200).json({ success: true, message: "User updated", data: { user } });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/users/:id   Admin only
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  // Prevent self-deletion
  if (req.user?.id === req.params.id) {
    res.status(400).json({ success: false, message: "You cannot delete your own account" });
    return;
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  res.status(200).json({ success: true, message: "User deleted successfully" });
}
