// lib/db.ts — Tekil PrismaClient instance (dev'de hot-reload sızıntısını önler)
import { PrismaClient } from "@prisma/client";              // Prisma client tipleri

// Global cache tipi: dev ortamında hot-reload sırasında tek instance tutmak için
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Named export: db  ← ÖNEMLİ: import { db } from "@/lib/db" bu ismi bekliyor
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],                                  // Gerekirse "query" ekleyebilirsin
  });

// Prod dışı ortamda client'ı global cache'e koyar (tek instance garanti)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Alias for other files that import `prisma` instead of `db`
export const prisma = db;
