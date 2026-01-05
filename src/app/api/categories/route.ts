/**
 * GET /api/categories - List all categories (public)
 * POST /api/categories - Create a category (admin only, for seeding/testing)
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const createCategorySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().uuid().optional(),
});

export const GET = withRequestContext(async (request, { requestId }) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      iconUrl: true,
      parentId: true,
    },
  });

  return NextResponse.json(
    { categories },
    { headers: { "x-request-id": requestId } }
  );
});

export const POST = withRequestContext(async (request: NextRequest, { requestId, logger }) => {
  const body = await request.json();
  const data = createCategorySchema.parse(body);

  const category = await prisma.category.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
    },
  });

  logger.info("Category created", { categoryId: category.id, slug: category.slug });

  return NextResponse.json(
    {
      message: "Category created successfully",
      category: {
        id: category.id,
        slug: category.slug,
        name: category.name,
      },
    },
    { status: 201, headers: { "x-request-id": requestId } }
  );
});
