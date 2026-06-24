import request from "supertest";
import mongoose from "mongoose";
import app from "@/app";
import { connectTestDB, clearCollections } from "@/tests/setup";
import { disconnectTestDB } from "@/tests/teardown";
import {
  createTeacher,
  createStudent,
  createAdmin,
  createCourse,
  createAndLogin,
  authHeader,
} from "@/tests/helpers";

beforeAll(async () => {
  await connectTestDB();
  await clearCollections();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/courses  (public)
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/courses", () => {
  beforeAll(async () => {
    const teacher = await createTeacher({ email: "teacher-list@test.com" });
    await createCourse({
      title:    "Public Course A",
      teachers: [teacher._id],
      isPublished: true,
    });
    await createCourse({
      title:    "Public Course B",
      teachers: [teacher._id],
      isPublished: true,
    });
  });

  it("returns 200 with a list of published courses (no auth required)", async () => {
    const res = await request(app).get("/api/v1/courses");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("filters by level query parameter", async () => {
    const res = await request(app)
      .get("/api/v1/courses")
      .query({ level: "BEGINNER" });
    expect(res.status).toBe(200);
    if (res.body.data.length > 0) {
      expect(res.body.data.every((c: { level: string }) => c.level === "BEGINNER")).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/courses/:id  (public)
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/courses/:id", () => {
  it("returns 200 with the course for a valid id", async () => {
    const teacher = await createTeacher({ email: "teacher-get@test.com" });
    const course  = await createCourse({ title: "Fetchable Course", teachers: [teacher._id] });

    const res = await request(app).get(`/api/v1/courses/${course._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Fetchable Course");
  });

  it("returns 404 for a non-existent course", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res    = await request(app).get(`/api/v1/courses/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for a malformed id", async () => {
    const res = await request(app).get("/api/v1/courses/not-an-id");
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/courses/search  (public)
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/courses/search", () => {
  it("returns 200 with matching courses", async () => {
    const res = await request(app)
      .get("/api/v1/courses/search")
      .query({ q: "Course" });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("returns 422 when q is missing", async () => {
    const res = await request(app).get("/api/v1/courses/search");
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/courses  (teacher or admin)
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/courses", () => {
  it("creates a course when called by a teacher", async () => {
    const { user: teacher, accessToken } = await createAndLogin({
      email: "create-teacher@test.com",
      role:  "teacher",
    });

    const res = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(accessToken))
      .send({
        title:       "Teacher Created Course",
        description: "This course was created by a teacher in a test.",
        category:    "Science",
        level:       "INTERMEDIATE",
        campus:      "Oslo",
        teachers:    [teacher._id.toString()],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Teacher Created Course");
    expect(res.body.data.campus).toBe("Oslo");
  });

  it("returns 403 when called by a student", async () => {
    const { user: student, accessToken } = await createAndLogin({
      email: "student-create@test.com",
      role:  "student",
    });

    const res = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(accessToken))
      .send({
        title:       "Student Attempt",
        description: "Students cannot create courses.",
        category:    "Science",
        level:       "BEGINNER",
        campus:      "Oslo",
        teachers:    [student._id.toString()],
      });

    expect(res.status).toBe(403);
  });

  it("returns 422 when required fields are missing", async () => {
    const { accessToken } = await createAndLogin({
      email: "teacher-missing@test.com",
      role:  "teacher",
    });

    const res = await request(app)
      .post("/api/v1/courses")
      .set(authHeader(accessToken))
      .send({ title: "Incomplete" }); // missing description, category, level, campus, teachers

    expect(res.status).toBe(422);
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app)
      .post("/api/v1/courses")
      .send({ title: "Anonymous Course" });
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/courses/:id  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
describe("PATCH /api/v1/courses/:id", () => {
  it("updates a course when called by an admin", async () => {
    const teacher = await createTeacher({ email: "teacher-patch@test.com" });
    const course  = await createCourse({ title: "Original Title", teachers: [teacher._id] });
    const { accessToken } = await createAndLogin({
      email: "admin-patch@test.com",
      role:  "admin",
    });

    const res = await request(app)
      .patch(`/api/v1/courses/${course._id}`)
      .set(authHeader(accessToken))
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated Title");
  });

  it("returns 403 when called by a teacher", async () => {
    const teacher = await createTeacher({ email: "teacher-patch2@test.com" });
    const course  = await createCourse({ teachers: [teacher._id] });
    const { accessToken } = await createAndLogin({
      email: "teacher-patch3@test.com",
      role:  "teacher",
    });

    const res = await request(app)
      .patch(`/api/v1/courses/${course._id}`)
      .set(authHeader(accessToken))
      .send({ title: "Unauthorized Update" });

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/courses/:id  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
describe("DELETE /api/v1/courses/:id", () => {
  it("soft-deletes (unpublishes) a course when called by admin", async () => {
    const teacher = await createTeacher({ email: "teacher-del@test.com" });
    const course  = await createCourse({ title: "Delete Me", teachers: [teacher._id] });
    const { accessToken } = await createAndLogin({
      email: "admin-del@test.com",
      role:  "admin",
    });

    const res = await request(app)
      .delete(`/api/v1/courses/${course._id}`)
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
  });

  it("returns 403 for a student", async () => {
    const teacher = await createTeacher({ email: "teacher-del2@test.com" });
    const course  = await createCourse({ teachers: [teacher._id] });
    const { accessToken } = await createAndLogin({
      email: "student-del@test.com",
      role:  "student",
    });

    const res = await request(app)
      .delete(`/api/v1/courses/${course._id}`)
      .set(authHeader(accessToken));

    expect(res.status).toBe(403);
  });
});
