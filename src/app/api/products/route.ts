/**
 * POST /api/products - Create a new product (seller only)
 * GET /api/products - List seller's own products
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { requireSellerProfile } from "@/lib/auth/requireCapability";
import { handleApiError } from "@/lib/api/errors";
import { createProductSchema, paginationSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const userContext = await requireUser();
    requireSellerProfile(userContext);

    const body = await request.json();
    const data = createProductSchema.parse(body);

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CATEGORY",
            message: "The specified category does not exist",
          },
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sellerId: userContext.sellerProfile!.id,
        title: data.title,
        description: data.description ?? null,
        priceAmount: data.priceAmount,
        currency: data.currency,
        stockQuantity: data.stockQuantity,
        categoryId: data.categoryId,
        // Products start as DRAFT by default (defined in schema)
      },
      include: {
        category: {
          select: { id: true, slug: true, name: true },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        product: {
          id: product.id,
          title: product.title,
          description: product.description,
          priceAmount: product.priceAmount,
          currency: product.currency,
          status: product.status,
          stockQuantity: product.stockQuantity,
          category: product.category,
          createdAt: product.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const userContext = await requireUser();
    requireSellerProfile(userContext);

    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: userContext.sellerProfile!.id },
        include: {
          category: {
            select: { id: true, slug: true, name: true },
          },
          images: {
            select: { id: true, url: true, sortOrder: true },
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: { sellerId: userContext.sellerProfile!.id },
      }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        priceAmount: p.priceAmount,
        currency: p.currency,
        status: p.status,
        stockQuantity: p.stockQuantity,
        category: p.category,
        thumbnail: p.images[0]?.url ?? null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

