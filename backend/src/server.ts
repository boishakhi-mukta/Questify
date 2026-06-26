import { env } from "./config/environment";
import { connectDB, disconnectDB } from "./config/database";
import { logger } from "./utils/logger";
import app from "./app";

async function main(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`, { env: env.NODE_ENV });
  });

  // Drop requests that stall for more than 30 s (covers slow DB queries / DDoS)
  server.timeout = 30_000;
  server.keepAliveTimeout = 65_000;  // must exceed ALB/proxy idle timeout (60 s)

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
