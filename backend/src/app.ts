import "express-async-errors";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "@/config/environment";
import { HTTP } from "@/config/constants";
import { generalLimiter } from "@/middleware/rateLimiter";
import { notFound, errorHandler } from "@/middleware/errorHandler";

const app = express();

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
// import authRoutes from "@/routes/auth";
// import userRoutes from "@/routes/users";
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/users", userRoutes);

// ── 404 + error handler ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
