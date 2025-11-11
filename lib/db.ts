// lib/db.ts — Tekil PrismaClient instance (dev'de hot-reload sızıntısını önler)
import { PrismaClient } from "@prisma/client";              // Prisma client tipleri

// Global cache tipi: dev ortamında hot-reload sırasında tek instance tutmak için
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Named export: db  ← ÖNEMLİ: import { db } from "@/lib/db" bu ismi bekliyor
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: "minimal",
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Prod dışı ortamda client'ı global cache'e koyar (tek instance garanti)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
} else {
  // Production'da da global cache kullan (Vercel serverless için)
  globalForPrisma.prisma = db;
}

// Graceful shutdown handler
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await db.$disconnect();
  });
}

// Alias for other files that import `prisma` instead of `db`
export const prisma = db;
