import { PrismaClient } from "@prisma/client";

// Check if we're in edge runtime
const isEdge = typeof process === 'undefined' || process.env?.NEXT_RUNTIME === 'edge';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  if (isEdge) {
    // Edge runtime configuration - minimal
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  // Node.js runtime configuration - full features
  const client = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.NODE_ENV === 'production'
          ? process.env.DATABASE_URL
          : process.env.DIRECT_URL,
      },
    },
  });

  // Setup cleanup handlers only in Node.js environment
  const shutdown = async () => {
    await client.$disconnect();
    process.exit(0);
  };

  process.on('beforeExit', shutdown);
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return client;
};

const prismadb = globalThis.prisma ?? prismaClientSingleton();

// Prevent multiple instances in development (Node.js only)
if (!isEdge && process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismadb;
}

export default prismadb;
