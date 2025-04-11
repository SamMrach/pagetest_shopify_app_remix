import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// eslint-disable-next-line no-undef
const globalForPrisma = global;

// Check if prisma already exists on the global object
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });
}

const prisma = globalForPrisma.prisma;

export default prisma;
