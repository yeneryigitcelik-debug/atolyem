/**
 * GET /api/categories - List all categories (public)
 * POST /api/categories - Create a category (admin only, for seeding/testing)
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const createCategorySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: z.string().min(2).max(100),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        _count: {
          select: {
            products: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
    });

    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        productCount: c._count.products,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Simple category creation for testing/seeding
// In production, this should be admin-only
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createCategorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        slug: data.slug,
        name: data.name,
      },
    });

    return NextResponse.json(
      {
        message: "Category created successfully",
        category: {
          id: category.id,
          slug: category.slug,
          name: category.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

