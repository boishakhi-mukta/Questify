import request from "supertest";
import mongoose from "mongoose";
import app from "@/app";
import { connectTestDB, clearCollections } from "@/tests/setup";
import { disconnectTestDB } from "@/tests/teardown";
import {
  createTeacher,
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
// POST /api/v1/my-enrollments/enroll  (student self-enroll)
// ─────────────────────────────────────────────────────────────────────────────
describe("POST /api/v1/my-enrollments/enroll", () => {
  it("enrolls a student in a published course", async () => {
    const teacher = await createTeacher({ email: "teacher-enroll@test.com" });
    const course  = await createCourse({ title: "Enrollable Course", teachers: [teacher._id], maxCapacity: 10 });
    const { accessToken } = await createAndLogin({
      email: "student-enroll@test.com",
      role:  "student",
    });

    const res = await request(app)
      .post("/api/v1/my-enrollments/enroll")
      .set(authHeader(accessToken))
      .send({ courseId: course._id.toString() });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ACTIVE");
    expect(res.body.data.courseId.toString()).toBe(course._id.toString());
  });

  it("returns 409 if student tries to enroll in the same course twice", async () => {
    const teacher = await createTeacher({ email: "teacher-dup@test.com" });
    const course  = await createCourse({ teachers: [teacher._id] });
    const { accessToken } = await createAndLogin({
      email: "student-dup@test.com",
      role:  "student",
    });

    await request(app)
      .post("/api/v1/my-enrollments/enroll")
      .set(authHeader(accessToken))
      .send({ courseId: course._id.toString() });

    const res = await request(app)
      .post("/api/v1/my-enrollments/enroll")
      .set(authHeader(accessToken))
      .send({ courseId: course._id.toString() });

    expect(res.status).toBe(409);
  });

  it("returns 404 for a non-existent course", async () => {
    const { accessToken } = await createAndLogin({
      email: "student-noexist@test.com",
      role:  "student",
    });
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post("/api/v1/my-enrollments/enroll")
      .set(authHeader(accessToken))
      .send({ courseId: fakeId });

    expect(res.status).toBe(404);
  });

  it("returns 422 for an invalid courseId format", async () => {
    const { accessToken } = await createAndLogin({
      email: "student-badid@test.com",
      role:  "student",
    });

    const res = await request(app)
      .post("/api/v1/my-enrollments/enroll")
      .set(authHeader(accessToken))
      .send({ courseId: "not-an-object-id" });

    expect(res.status).toBe(422);
  });

  it("returns 403 when a teacher tries to enroll", async () => {
    const teacher = await createTeacher({ email: "teacher-self-enroll@test.com" });
    const course  = await createCourse({ teachers: [teacher._id] });
    const { accessToken } = await createAndLogin({
      email: "teacher-tries-enroll@test.com",
      role:  "teacher",
    });

    const res = await request(app)
      .post("/api/v1/my-enrollments/enroll")
      .set(authHeader(accessToken))
      .send({ courseId: course._id.toString() });

    expect(res.status).toBe(403);
  });

  it("returns 401 without auth", async () => {
    const teacher = await createTeacher({ email: "teacher-noauth@test.com" });
    const course  = await createCourse({ teachers: [teacher._id] });

    const res = await request(app)
      .post("/api/v1/my-enrollments/enroll")
      .send({ courseId: course._id.toString() });

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/my-enrollments  (student)
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/my-enrollments", () => {
  it("returns the student's enrollment list", async () => {
    const teacher = await createTeacher({ email: "teacher-list-enroll@test.com" });
    const course  = await createCourse({ teachers: [teacher._id] });
    const { accessToken } = await createAndLogin({
      email: "student-list@test.com",
      role:  "student",
    });

    // Enroll first
    await request(app)
      .post("/api/v1/my-enrollments/enroll")
      .set(authHeader(accessToken))
      .send({ courseId: course._id.toString() });

    const res = await request(app)
      .get("/api/v1/my-enrollments")
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("returns an empty list for a student with no enrollments", async () => {
    const { accessToken } = await createAndLogin({
      email: "student-empty@test.com",
      role:  "student",
    });

    const res = await request(app)
      .get("/api/v1/my-enrollments")
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("returns 403 for a teacher", async () => {
    const { accessToken } = await createAndLogin({
      email: "teacher-myenroll@test.com",
      role:  "teacher",
    });
    const res = await request(app)
      .get("/api/v1/my-enrollments")
      .set(authHeader(accessToken));
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/my-enrollments/:courseId  (student)
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/my-enrollments/:courseId", () => {
  it("returns the enrollment for a specific course the student is in", async () => {
    const teacher = await createTeacher({ email: "teacher-single@test.com" });
    const course  = await createCourse({ teachers: [teacher._id] });
    const { accessToken } = await createAndLogin({
      email: "student-single@test.com",
      role:  "student",
    });

    await request(app)
      .post("/api/v1/my-enrollments/enroll")
      .set(authHeader(accessToken))
      .send({ courseId: course._id.toString() });

    const res = await request(app)
      .get(`/api/v1/my-enrollments/${course._id}`)
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
    expect(res.body.data.courseId.toString()).toBe(course._id.toString());
  });

  it("returns 404 for a course the student is not enrolled in", async () => {
    const teacher = await createTeacher({ email: "teacher-not-enrolled@test.com" });
    const course  = await createCourse({ teachers: [teacher._id] });
    const { accessToken } = await createAndLogin({
      email: "student-not-enrolled@test.com",
      role:  "student",
    });

    const res = await request(app)
      .get(`/api/v1/my-enrollments/${course._id}`)
      .set(authHeader(accessToken));

    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/my-enrollments/:enrollmentId  (student self-unenroll)
// ─────────────────────────────────────────────────────────────────────────────
describe("DELETE /api/v1/my-enrollments/:enrollmentId", () => {
  it("unenrolls (soft-drops) the student from the course", async () => {
    const teacher = await createTeacher({ email: "teacher-unenroll@test.com" });
    const course  = await createCourse({ teachers: [teacher._id] });
    const { accessToken } = await createAndLogin({
      email: "student-unenroll@test.com",
      role:  "student",
    });

    // Enroll
    const enrollRes = await request(app)
      .post("/api/v1/my-enrollments/enroll")
      .set(authHeader(accessToken))
      .send({ courseId: course._id.toString() });

    const enrollmentId = enrollRes.body.data._id;

    // Unenroll
    const dropRes = await request(app)
      .delete(`/api/v1/my-enrollments/${enrollmentId}`)
      .set(authHeader(accessToken));

    expect(dropRes.status).toBe(200);
    expect(dropRes.body.data.status).toBe("DROPPED");
  });

  it("returns 404 for an enrollment that does not exist", async () => {
    const { accessToken } = await createAndLogin({
      email: "student-nodrop@test.com",
      role:  "student",
    });
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/v1/my-enrollments/${fakeId}`)
      .set(authHeader(accessToken));

    expect(res.status).toBe(404);
  });

  it("returns 403 if a student tries to drop another student's enrollment", async () => {
    const teacher   = await createTeacher({ email: "teacher-forbid@test.com" });
    const course    = await createCourse({ teachers: [teacher._id] });
    const { accessToken: tokenA } = await createAndLogin({ email: "student-a@test.com", role: "student" });
    const { accessToken: tokenB } = await createAndLogin({ email: "student-b@test.com", role: "student" });

    // Student A enrolls
    const enrollRes = await request(app)
      .post("/api/v1/my-enrollments/enroll")
      .set(authHeader(tokenA))
      .send({ courseId: course._id.toString() });

    const enrollmentId = enrollRes.body.data._id;

    // Student B tries to drop Student A's enrollment
    const res = await request(app)
      .delete(`/api/v1/my-enrollments/${enrollmentId}`)
      .set(authHeader(tokenB));

    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin enrollment views
// ─────────────────────────────────────────────────────────────────────────────
describe("GET /api/v1/enrollments (admin)", () => {
  it("returns all enrollments for an admin", async () => {
    const { accessToken } = await createAndLogin({
      email: "admin-enroll-list@test.com",
      role:  "admin",
    });

    const res = await request(app)
      .get("/api/v1/enrollments")
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("returns 403 for a student", async () => {
    const { accessToken } = await createAndLogin({
      email: "student-admin-enroll@test.com",
      role:  "student",
    });
    const res = await request(app)
      .get("/api/v1/enrollments")
      .set(authHeader(accessToken));
    expect(res.status).toBe(403);
  });
});
