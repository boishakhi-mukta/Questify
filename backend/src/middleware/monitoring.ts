/**
 * ============================================================================
 * QUESTIFY MIDDLEWARE: System Monitoring
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Tracks performance times and details.
 * 
 * WHY IT EXISTS:
 * Alerts developers to slow database calls or rising error rates.
 * 
 * HOW IT WORKS (Technical Overview):
 * Computes average response latency and reports database check statuses.
 * ============================================================================
 */

import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { logger } from "@/utils/logger";
import type { AuthenticatedRequest } from "@/types";

// ── In-process counters (reset on restart — use Datadog/Prometheus for durable metrics) ──
const metrics = {
  requests:    { total: 0, success: 0, clientError: 0, serverError: 0 },
  responseTimes: [] as number[], // rolling last 1000 samples
};

function recordResponseTime(ms: number): void {
  metrics.responseTimes.push(ms);
  if (metrics.responseTimes.length > 1000) metrics.responseTimes.shift();
}

function p95(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1];
}

// ── Request timing + structured access log ─────────────────────────────────────
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startAt = process.hrtime.bigint();
  const requestId = (res.locals.requestId as string | undefined) ?? "unknown";

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startAt) / 1_000_000;
    const status = res.statusCode;

    // Update counters
    metrics.requests.total++;
    if (status < 400)       metrics.requests.success++;
    else if (status < 500)  metrics.requests.clientError++;
    else                    metrics.requests.serverError++;

    recordResponseTime(durationMs);

    const authReq = req as AuthenticatedRequest;
    const logData = {
      category:    "http",
      requestId,
      method:      req.method,
      url:         req.originalUrl,
      status,
      durationMs:  Math.round(durationMs * 100) / 100,
      ip:          req.ip,
      userId:      authReq.user?.id,
      userAgent:   req.get("user-agent"),
      contentLength: res.get("content-length"),
    };

    // Warn on slow responses; error on 5xx; info otherwise
    if (status >= 500) {
      logger.error(`${req.method} ${req.originalUrl} ${status}`, logData);
    } else if (durationMs > 1000) {
      logger.warn(`Slow response: ${req.method} ${req.originalUrl}`, logData);
    } else {
      logger.http(`${req.method} ${req.originalUrl} ${status}`, logData);
    }
  });

  next();
}

// ── Metrics snapshot ──────────────────────────────────────────────────────────
export function getMetrics() {
  const sorted = [...metrics.responseTimes].sort((a, b) => a - b);
  const total  = sorted.length;
  const avg    = total > 0 ? sorted.reduce((a, b) => a + b, 0) / total : 0;

  return {
    requests: { ...metrics.requests },
    responseTimes: {
      samples:  total,
      avgMs:    Math.round(avg * 100) / 100,
      p95Ms:    Math.round(p95(sorted) * 100) / 100,
      maxMs:    Math.round((sorted[sorted.length - 1] ?? 0) * 100) / 100,
    },
    errorRate: metrics.requests.total > 0
      ? Math.round((metrics.requests.serverError / metrics.requests.total) * 10000) / 100
      : 0,
  };
}

// ── Dependency health checks ──────────────────────────────────────────────────

async function checkMongo(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const start = Date.now();
  try {
    const state = mongoose.connection.readyState;
    if (state !== 1) {
      return { ok: false, error: `readyState=${state} (expected 1=connected)` };
    }
    // Ping the actual server to confirm the connection is live
    await mongoose.connection.db!.admin().ping();
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ── Health check handler ──────────────────────────────────────────────────────
// Replaces the simple /health stub in app.ts with a deep health check.

export async function healthCheck(
  _req: Request,
  res: Response
): Promise<void> {
  const start = Date.now();
  const mongo = await checkMongo();
  const perf  = getMetrics();

  const allHealthy = mongo.ok;
  const statusCode = allHealthy ? 200 : 503;

  const body = {
    success:   allHealthy,
    status:    allHealthy ? "healthy" : "degraded",
    version:   process.env.npm_package_version ?? "unknown",
    env:       process.env.NODE_ENV,
    uptime:    Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    responseTimeMs: Date.now() - start,
    dependencies: {
      mongodb: mongo,
    },
    metrics: perf,
  };

  if (!allHealthy) {
    logger.warn("Health check degraded", { mongo });
  }

  res.status(statusCode).json(body);
}
