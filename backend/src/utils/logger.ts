import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { env } from "@/config/environment";

// ── Log levels ─────────────────────────────────────────────────────────────────
// error > warn > info > http > debug
// In production only error/warn/info are emitted (http and debug are suppressed).
const LEVEL = env.NODE_ENV === "production" ? "info"
            : env.NODE_ENV === "test"       ? "warn"   // silence noise in tests
            : "debug";

// ── Formats ────────────────────────────────────────────────────────────────────

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const prettyFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? " " + JSON.stringify(meta)
      : "";
    return `${timestamp} [${level}] ${message}${metaStr}${stack ? "\n" + stack : ""}`;
  })
);

// ── Transports ─────────────────────────────────────────────────────────────────

const transports: winston.transport[] = [
  // stdout — always on; format depends on environment
  new winston.transports.Console({
    format: env.NODE_ENV === "production" ? jsonFormat : prettyFormat,
  }),
];

if (env.NODE_ENV === "production") {
  const logDir = process.env.LOG_DIR ?? "logs";

  // Rotating error log — keeps 14 days, 20 MB per file
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "14d",
      maxSize: "20m",
      format: jsonFormat,
      zippedArchive: true,
    })
  );

  // Rotating combined log — keeps 7 days
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "7d",
      maxSize: "20m",
      format: jsonFormat,
      zippedArchive: true,
    })
  );
}

// ── Root logger ────────────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  level: LEVEL,
  defaultMeta: { service: "questify-api", env: env.NODE_ENV },
  transports,
  // Prevent Winston from crashing the process on uncaught exceptions in
  // transports (e.g. disk full for file transport).
  exitOnError: false,
});

// ── Child logger factory ────────────────────────────────────────────────────────
// Creates a child logger that automatically includes the request ID in every
// log line emitted from within a request handler.
//
// Usage:
//   const log = childLogger(req);
//   log.info("Enrollment created", { enrollmentId });

export function childLogger(
  meta: Record<string, unknown>
): winston.Logger {
  return logger.child(meta);
}

// ── Convenience wrappers ───────────────────────────────────────────────────────

/** Log an auth event (login, logout, token refresh, password change) */
export function logAuthEvent(
  event: string,
  details: Record<string, unknown>
): void {
  logger.info(event, { category: "auth", ...details });
}

/** Log an admin/controller action (create, update, delete, assign) */
export function logAction(
  action: string,
  details: Record<string, unknown>
): void {
  logger.info(action, { category: "action", ...details });
}

/** Log a performance timing measurement */
export function logPerf(
  label: string,
  durationMs: number,
  meta?: Record<string, unknown>
): void {
  const level = durationMs > 500 ? "warn" : "debug";
  logger[level](label, { category: "perf", durationMs, ...meta });
}
