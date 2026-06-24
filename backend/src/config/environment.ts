import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().positive().default(8000),

  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .refine(
      (v) => v.startsWith("mongodb://") || v.startsWith("mongodb+srv://"),
      "MONGODB_URI must begin with mongodb:// or mongodb+srv://"
    ),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z.string().default("7d"),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(100),

  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),

  LOG_FORMAT: z
    .enum(["combined", "dev", "short", "tiny"])
    .default("dev"),

  // ── Email (all optional — falls back to console logging in dev) ───────────────
  SMTP_HOST:   z.string().optional(),
  SMTP_PORT:   z.coerce.number().positive().optional(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER:   z.string().optional(),
  SMTP_PASS:   z.string().optional(),
  SMTP_FROM:   z.string().default("noreply@questify.app"),

  APP_URL: z.string().default("http://localhost:3000"),

  // ── Clerk Backend API (optional — enables Clerk user sync) ───────────────────
  CLERK_SECRET_KEY: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  console.error(`❌  Invalid environment variables:\n${issues}`);
  process.exit(1);
}

export const env: Env = Object.freeze(parsed.data);
