import { Response } from "express";
import { Types } from "mongoose";
import { Course } from "@/models/Course";
import { Material } from "@/models/Material";
import { Enrollment } from "@/models/Enrollment";
import { XPModel } from "@/models/XP";
import { NotFoundError, AuthorizationError } from "@/utils/errors";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  buildPaginationMeta,
} from "@/utils/responses";
import { PAGINATION } from "@/config/constants";
import { logAction } from "@/utils/logger";
import type { AuthenticatedRequest } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────────

async function assertCourseAccess(
  courseId: Types.ObjectId | string,
  userId: string,
  role: string
): Promise<void> {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new NotFoundError("Course");

  if (role === "teacher") {
    const assigned = course.teachers.some((t) => t.toString() === userId);
    if (!assigned) {
      throw new AuthorizationError("You are not assigned to this course.");
    }
  }
}

// ── POST /api/v1/materials ─────────────────────────────────────────────────────
export async function createMaterial(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const body = req.body as {
    courseId: string;
    order?: number;
    [key: string]: unknown;
  };

  await assertCourseAccess(body.courseId, req.user!.id, req.user!.role);

  // Auto-increment order when caller omits it
  if (body.order === undefined) {
    const count = await Material.countDocuments({ courseId: body.courseId });
    body.order = count;
  }

  const material = await Material.create({
    ...body,
    uploadedBy: new Types.ObjectId(req.user!.id),
  });

  logAction("MATERIAL_CREATED", {
    materialId: material._id.toString(),
    courseId: body.courseId,
    uploadedBy: req.user!.id,
    title: material.title,
    type: material.type,
  });

  sendCreated(res, { material }, "Material uploaded successfully");
}

// ── GET /api/v1/materials/course/:courseId ─────────────────────────────────────
export async function getCourseMaterials(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { courseId } = req.params;
  const { page = "1", limit = String(PAGINATION.DEFAULT_LIMIT) } =
    req.query as Record<string, string>;

  const course = await Course.findById(courseId).lean();
  if (!course) throw new NotFoundError("Course");

  // Students: must have an active enrollment
  if (req.user!.role === "student") {
    const enrolled = await Enrollment.findOne({
      studentId: req.user!.id,
      courseId,
      status: "ACTIVE",
    }).lean();
    if (!enrolled) {
      throw new AuthorizationError("You are not enrolled in this course.");
    }
  }

  // Teachers: must be assigned (admins pass through)
  if (req.user!.role === "teacher") {
    const assigned = course.teachers.some(
      (t) => t.toString() === req.user!.id
    );
    if (!assigned) {
      throw new AuthorizationError("You are not assigned to this course.");
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(limit, 10))
  );
  const skip = (pageNum - 1) * limitNum;

  // Only published materials are visible to students;
  // teachers/admins see everything in the course
  const filter: Record<string, unknown> = {
    courseId: new Types.ObjectId(courseId),
  };
  if (req.user!.role === "student") filter.isPublished = true;

  const [materials, total] = await Promise.all([
    Material.find(filter)
      .populate("uploadedBy", "firstName lastName")
      .sort({ order: 1, createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Material.countDocuments(filter),
  ]);

  sendPaginated(
    res,
    materials,
    buildPaginationMeta(pageNum, limitNum, total),
    "Materials retrieved successfully"
  );
}

// ── GET /api/v1/materials/:id/view ────────────────────────────────────────────
export async function viewMaterial(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const material = await Material.findOne({
    _id: req.params.id,
    isPublished: true,
  });
  if (!material) throw new NotFoundError("Material");

  // Students: verify enrollment, then award XP (idempotent)
  if (req.user!.role === "student") {
    const enrolled = await Enrollment.findOne({
      studentId: req.user!.id,
      courseId: material.courseId,
      status: "ACTIVE",
    }).lean();
    if (!enrolled) {
      throw new AuthorizationError("You are not enrolled in this course.");
    }

    // Increment view counter (fire-and-forget; non-blocking on error)
    Material.findByIdAndUpdate(material._id, { $inc: { views: 1 } }).exec();

    // Award MATERIAL_READ XP — duplicate key on the sparse unique index
    // silently absorbs repeat views, so XP is only awarded once per student.
    await XPModel.create({
      studentId: new Types.ObjectId(req.user!.id),
      courseId: material.courseId,
      type: "MATERIAL_READ",
      metadata: { materialId: material._id },
    }).catch(() => undefined);

    logAction("MATERIAL_VIEWED", {
      materialId: material._id.toString(),
      courseId: material.courseId.toString(),
      studentId: req.user!.id,
    });
  }

  sendSuccess(res, { material }, "Material retrieved successfully");
}

// ── PATCH /api/v1/materials/:id ───────────────────────────────────────────────
export async function updateMaterial(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const material = await Material.findById(req.params.id);
  if (!material) throw new NotFoundError("Material");

  await assertCourseAccess(material.courseId, req.user!.id, req.user!.role);

  // Strip fields that must never be patched directly
  const {
    uploadedBy: _u,
    courseId: _c,
    views: _v,
    ...safeFields
  } = req.body as Record<string, unknown>;

  const updated = await Material.findByIdAndUpdate(
    material._id,
    { $set: safeFields },
    { new: true, runValidators: true }
  );

  logAction("MATERIAL_UPDATED", {
    materialId: material._id.toString(),
    courseId: material.courseId.toString(),
    updatedBy: req.user!.id,
    fields: Object.keys(safeFields),
  });

  sendSuccess(res, { material: updated }, "Material updated successfully");
}

// ── DELETE /api/v1/materials/:id ──────────────────────────────────────────────
/**
 * Soft-delete: marks material as unpublished instead of removing the row.
 * The material is hidden from student list queries but remains in the DB
 * for audit and recovery purposes.
 */
export async function deleteMaterial(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const material = await Material.findById(req.params.id);
  if (!material) throw new NotFoundError("Material");

  await assertCourseAccess(material.courseId, req.user!.id, req.user!.role);

  await material.updateOne({ isPublished: false });

  logAction("MATERIAL_DELETED", {
    materialId: material._id.toString(),
    courseId: material.courseId.toString(),
    title: material.title,
    deletedBy: req.user!.id,
  });

  sendSuccess(res, null, "Material deleted successfully");
}
