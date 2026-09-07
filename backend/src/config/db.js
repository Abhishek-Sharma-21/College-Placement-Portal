import { prisma } from "./prisma.js";

export async function connectMongo() {
  try {
    // Run a simple query to verify database connection is alive
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Neon PostgreSQL Connected Successfully");
  } catch (error) {
    console.error("❌ PostgreSQL Connection Failed:", error.message);
    process.exit(1); // Exit if connection fails
  }
}
