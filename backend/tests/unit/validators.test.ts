import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  createCourseSchema,
  createAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
  selfEnrollSchema,
  createMaterialSchema,
  adminCreateUserSchema,
} from "@/utils/validators";

// ─────────────────────────────────────────────────────────────────────────────
// loginSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({ email: "alice@test.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("lowercases the email", () => {
    const result = loginSchema.safeParse({ email: "ALICE@TEST.COM", password: "x" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("alice@test.com");
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com" });
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// registerSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("registerSchema", () => {
  const valid = {
    email:     "student@test.com",
    password:  "Secure@123",
    firstName: "Alice",
    lastName:  "Smith",
  };

  it("accepts a fully valid payload", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects password without uppercase", () => {
    const r = registerSchema.safeParse({ ...valid, password: "secure@123" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message.includes("uppercase"))).toBe(true);
    }
  });

  it("rejects password without special character", () => {
    const r = registerSchema.safeParse({ ...valid, password: "SecurePass1" });
    expect(r.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const r = registerSchema.safeParse({ ...valid, password: "Ab@1" });
    expect(r.success).toBe(false);
  });

  it("rejects missing firstName", () => {
    const { firstName: _f, ...rest } = valid;
    const r = registerSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// changePasswordSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "OldPass@1",
    newPassword:     "NewPass@2",
  };

  it("accepts valid current + new password", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects when new password is the same as current", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "Same@Pass1",
      newPassword:     "Same@Pass1",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("newPassword"))).toBe(true);
    }
  });

  it("rejects a weak new password", () => {
    const r = changePasswordSchema.safeParse({
      currentPassword: "Current@1",
      newPassword:     "weak",
    });
    expect(r.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createCourseSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("createCourseSchema", () => {
  const validTeacherId = "a".repeat(24);
  const valid = {
    title:       "Web Development Fundamentals",
    description: "Learn HTML, CSS, and JavaScript from the ground up.",
    category:    "Technology",
    level:       "BEGINNER",
    campus:      "Halden",
    teachers:    [validTeacherId],
  };

  it("accepts a minimal valid course", () => {
    expect(createCourseSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects title shorter than 3 characters", () => {
    expect(createCourseSchema.safeParse({ ...valid, title: "AB" }).success).toBe(false);
  });

  it("rejects an invalid level enum", () => {
    expect(createCourseSchema.safeParse({ ...valid, level: "EXPERT" }).success).toBe(false);
  });

  it("rejects teachers array with invalid ObjectId", () => {
    const r = createCourseSchema.safeParse({ ...valid, teachers: ["not-an-id"] });
    expect(r.success).toBe(false);
  });

  it("rejects empty teachers array", () => {
    const r = createCourseSchema.safeParse({ ...valid, teachers: [] });
    expect(r.success).toBe(false);
  });

  it("accepts optional fields (imageUrl, semester, credits)", () => {
    const r = createCourseSchema.safeParse({
      ...valid,
      imageUrl: "https://example.com/image.png",
      semester: "Spring 2026",
      credits:  4,
    });
    expect(r.success).toBe(true);
  });

  it("rejects an invalid imageUrl", () => {
    const r = createCourseSchema.safeParse({ ...valid, imageUrl: "not-a-url" });
    expect(r.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createAssignmentSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("createAssignmentSchema", () => {
  const futureDue = new Date(Date.now() + 86_400_000 * 7).toISOString();
  const valid = {
    courseId:       "a".repeat(24),
    title:          "Week 1 Assignment",
    description:    "Implement a basic REST API with Express.",
    dueDate:        futureDue,
    submissionType: "TEXT",
  };

  it("accepts a valid assignment", () => {
    expect(createAssignmentSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a past dueDate", () => {
    const r = createAssignmentSchema.safeParse({
      ...valid,
      dueDate: new Date(Date.now() - 1000).toISOString(),
    });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid submissionType", () => {
    const r = createAssignmentSchema.safeParse({ ...valid, submissionType: "SLIDES" });
    expect(r.success).toBe(false);
  });

  it("accepts latePenalty between 0 and 100", () => {
    expect(createAssignmentSchema.safeParse({ ...valid, latePenalty: 20 }).success).toBe(true);
  });

  it("rejects latePenalty above 100", () => {
    expect(createAssignmentSchema.safeParse({ ...valid, latePenalty: 101 }).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// submitAssignmentSchema — refinement: content OR fileUrl required
// ─────────────────────────────────────────────────────────────────────────────
describe("submitAssignmentSchema", () => {
  const assignmentId = "b".repeat(24);

  it("accepts submissionContent only", () => {
    const r = submitAssignmentSchema.safeParse({
      assignmentId,
      submissionContent: "My answer goes here.",
    });
    expect(r.success).toBe(true);
  });

  it("accepts fileUrl only", () => {
    const r = submitAssignmentSchema.safeParse({
      assignmentId,
      fileUrl: "https://storage.example.com/file.pdf",
    });
    expect(r.success).toBe(true);
  });

  it("rejects when neither content nor fileUrl is provided", () => {
    const r = submitAssignmentSchema.safeParse({ assignmentId });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].message).toMatch(/submissionContent|fileUrl/i);
    }
  });

  it("rejects an invalid fileUrl", () => {
    const r = submitAssignmentSchema.safeParse({
      assignmentId,
      fileUrl: "not-a-url",
    });
    expect(r.success).toBe(false);
  });

  it("rejects submissionContent longer than 50 000 chars", () => {
    const r = submitAssignmentSchema.safeParse({
      assignmentId,
      submissionContent: "x".repeat(50_001),
    });
    expect(r.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// gradeSubmissionSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("gradeSubmissionSchema", () => {
  it("accepts score 0–100 with optional feedback", () => {
    expect(gradeSubmissionSchema.safeParse({ score: 85, feedback: "Great work!" }).success).toBe(true);
    expect(gradeSubmissionSchema.safeParse({ score: 0 }).success).toBe(true);
    expect(gradeSubmissionSchema.safeParse({ score: 100 }).success).toBe(true);
  });

  it("rejects score below 0", () => {
    expect(gradeSubmissionSchema.safeParse({ score: -1 }).success).toBe(false);
  });

  it("rejects score above 100", () => {
    expect(gradeSubmissionSchema.safeParse({ score: 101 }).success).toBe(false);
  });

  it("rejects non-numeric score", () => {
    expect(gradeSubmissionSchema.safeParse({ score: "ninety" }).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// selfEnrollSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("selfEnrollSchema", () => {
  it("accepts a valid ObjectId courseId", () => {
    expect(selfEnrollSchema.safeParse({ courseId: "c".repeat(24) }).success).toBe(true);
  });

  it("rejects a non-ObjectId courseId", () => {
    expect(selfEnrollSchema.safeParse({ courseId: "not-an-id" }).success).toBe(false);
  });

  it("rejects missing courseId", () => {
    expect(selfEnrollSchema.safeParse({}).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createMaterialSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("createMaterialSchema", () => {
  const valid = {
    courseId: "d".repeat(24),
    title:    "Lecture 1 Slides",
    type:     "PDF",
    url:      "https://cdn.example.com/lecture1.pdf",
  };

  it("accepts a valid material", () => {
    expect(createMaterialSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid type enum", () => {
    expect(createMaterialSchema.safeParse({ ...valid, type: "SLIDES" }).success).toBe(false);
  });

  it("rejects a non-URL url field", () => {
    expect(createMaterialSchema.safeParse({ ...valid, url: "not-a-url" }).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// adminCreateUserSchema
// ─────────────────────────────────────────────────────────────────────────────
describe("adminCreateUserSchema", () => {
  const valid = {
    email:     "newuser@test.com",
    firstName: "New",
    lastName:  "User",
    role:      "student",
  };

  it("accepts all three roles", () => {
    for (const role of ["admin", "teacher", "student"]) {
      expect(adminCreateUserSchema.safeParse({ ...valid, role }).success).toBe(true);
    }
  });

  it("rejects an unknown role", () => {
    expect(adminCreateUserSchema.safeParse({ ...valid, role: "superuser" }).success).toBe(false);
  });

  it("accepts optional department code", () => {
    expect(adminCreateUserSchema.safeParse({ ...valid, department: "CS" }).success).toBe(true);
  });
});
