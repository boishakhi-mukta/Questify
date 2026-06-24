import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "@/config/environment";
import { HTTP } from "@/config/constants";
import { generalLimiter } from "@/middleware/rateLimiter";
import { attachRequestId } from "@/middleware/requestId";
import { notFound, errorHandler } from "@/middleware/errorHandler";

const app = express();

// ── Request ID — mount first so every handler and the error handler can read it
app.use(attachRequestId);

// ── Security headers ───────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ── Request logging ────────────────────────────────────────────────────────────
app.use(morgan(env.LOG_FORMAT));

// ── Body parsers ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ── Global rate limiter ────────────────────────────────────────────────────────
app.use(generalLimiter);

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(HTTP.OK).json({
    success: true,
    message: "OK",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ─────────────────────────────────────────────────────────────────
import authRoutes from "@/routes/auth";
import userRoutes from "@/routes/users";
import courseRoutes from "@/routes/courses";
import adminRoutes from "@/routes/admin";
import materialRoutes from "@/routes/materials";
import assignmentRoutes from "@/routes/assignments";
import enrollmentRoutes from "@/routes/enrollments";
import myEnrollmentRoutes from "@/routes/my-enrollments";
import submissionRoutes from "@/routes/submissions";
import analyticsRoutes from "@/routes/analytics";
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/materials", materialRoutes);
app.use("/api/v1/assignments", assignmentRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/my-enrollments", myEnrollmentRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// ── 404 + error handler ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
