import { env } from "./config/environment";
import { connectDB, disconnectDB } from "./config/database";
import app from "./app";

async function main(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(
      `🚀  Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`
    );
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    server.close(async () => {
      await disconnectDB();
      console.log("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    process.exit(1);
  });
}

main();
