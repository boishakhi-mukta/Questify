/**
 * ============================================================================
 * QUESTIFY SERVER STARTUP: Server Listener
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The startup script that boots up the server and listens for incoming web requests.
 * 
 * WHY IT EXISTS:
 * The entryway trigger script that starts the node service and establishes database connections.
 * 
 * HOW IT WORKS (Technical Overview):
 * Calls database wrappers and boots Express on configuration ports (process.env.PORT).
 * ============================================================================
 */

import { env } from "./config/environment";
import { connectDB, disconnectDB } from "./config/database";
import { logger } from "./utils/logger";
import app from "./app";

// The program's entry point: connects to the database, starts the web
// server listening for requests, and sets up graceful shutdown so in-flight
// requests finish (and the database disconnects cleanly) if the process is
// asked to stop instead of dying abruptly.
async function main(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`, { env: env.NODE_ENV });
  });

  // Drop requests that stall for more than 30 s (covers slow DB queries / DDoS)
  server.timeout = 30_000;
  server.keepAliveTimeout = 65_000;  // must exceed ALB/proxy idle timeout (60 s)

  // Handles a stop request (e.g. from the hosting platform during a
  // deploy/restart): stops accepting new requests, closes the database
  // connection, then exits cleanly.
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      logger.info("Server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", { reason });
    process.exit(1);
  });
}

main();
