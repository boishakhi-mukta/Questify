import { Request, Response } from "express";
import { User } from "@/models/User";
import { NotFoundError } from "@/utils/errors";
import type { AuthenticatedRequest, UserRole } from "@/types";

// ── GET /api/v1/users ─────────────────────────────────────────────────────────
export async function getUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const {
    role: filterRole,
    search,
    page = "1",
    limit = "20",
    isActive,
  } = req.query as Record<string, string>;

  const query: Record<string, unknown> = {};

  // Non-admins can only view students
  if (req.user?.role !== "admin") {
    query.role = "student";
  } else if (filterRole && ["teacher", "student"].includes(filterRole)) {
    query.role = filterRole;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
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

// ── GET /api/v1/users/:id ─────────────────────────────────────────────────────
export async function getUserById(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User");
  res.status(200).json({ success: true, message: "OK", data: { user } });
}

// ── POST /api/v1/users (Admin only) ───────────────────────────────────────────
export async function createUser(req: Request, res: Response): Promise<void> {
  const {
    email,
    firstName,
    lastName,
    password,
    role,
    avatar,
  } = req.body as {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: UserRole;
    avatar?: string;
  };

  if (role === "admin") {
    res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin accounts cannot be created via the API",
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const user = await User.create({
    email,
    firstName,
    lastName,
    passwordHash: password,
    role,
    avatar,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { user },
  });
}

// ── PUT /api/v1/users/:id (Admin only) ────────────────────────────────────────
export async function updateUser(req: Request, res: Response): Promise<void> {
  // Strip fields that must not be directly updated via this endpoint
  const {
    passwordHash: _ph,
    password: _pw,
    role,
    email: _email,
    ...safeFields
  } = req.body as Record<string, unknown>;

  if (role === "admin") {
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Cannot change a user's role to admin" },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...safeFields, ...(role ? { role } : {}) },
    { new: true, runValidators: true }
  );

  if (!user) throw new NotFoundError("User");

  res.status(200).json({ success: true, message: "User updated", data: { user } });
}

// ── DELETE /api/v1/users/:id (Admin only) ─────────────────────────────────────
export async function deleteUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (req.user?.id === req.params.id) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "You cannot delete your own account" },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new NotFoundError("User");

  res.status(200).json({ success: true, message: "User deleted successfully" });
}
