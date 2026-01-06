// Prisma configuration for atolyem.net
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use Direct URL for schema push/migrations (port 5432)
    // PgBouncer (port 6543) doesn't support prepared statements needed for migrations
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
    directUrl: process.env["DIRECT_URL"],
  },
});
