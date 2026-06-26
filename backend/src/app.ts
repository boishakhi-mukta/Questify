import "express-async-errors";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "@/config/environment";
import { generalLimiter } from "@/middleware/rateLimiter";
import { attachRequestId } from "@/middleware/requestId";
import { notFound, errorHandler } from "@/middleware/errorHandler";
import { requestLogger, healthCheck } from "@/middleware/monitoring";
import { logger } from "@/utils/logger";
import { openApiSpec } from "@/docs/openapi";

const app = express();

// ── Request ID — mount first so every handler and the error handler can read it
app.use(attachRequestId);

// ── API Docs — mounted before helmet so Swagger UI assets bypass CSP
// Disabled in production unless explicitly opted-in via ENABLE_DOCS=true
if (env.NODE_ENV !== "production" || process.env.ENABLE_DOCS === "true") {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec as Parameters<typeof swaggerUi.setup>[0], {
      customSiteTitle: "Questify API Docs",
      customCss: ".swagger-ui .topbar { background-color: #1a1a2e; } .swagger-ui .topbar-wrapper img { content: none; }",
      swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
    })
  );

  // Raw JSON spec — useful for importing into Postman / Insomnia
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(openApiSpec);
  });
}

// ── Compression — before any response-sending middleware ──────────────────────
app.use(compression());

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
// Morgan writes the access log line; Winston handles formatting and transport.
app.use(
  morgan(env.LOG_FORMAT, {
    stream: { write: (msg) => logger.http(msg.trimEnd()) },
  })
);
app.use(requestLogger);

// ── Body parsers ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ── Global rate limiter ────────────────────────────────────────────────────────
app.use(generalLimiter);

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", healthCheck);

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
