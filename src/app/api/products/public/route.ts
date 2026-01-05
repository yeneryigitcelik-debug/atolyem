/**
 * GET /api/products/public - List published products (public endpoint)
 * Supports filtering by category slug
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { productQuerySchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { ProductStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = productQuerySchema.parse({
      category: searchParams.get("category") ?? undefined,
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const skip = (query.page - 1) * query.limit;

    // Build where clause
    const where: {
      status: ProductStatus;
      stockQuantity: { gt: number };
      category?: { slug: string };
    } = {
      status: ProductStatus.PUBLISHED,
      stockQuantity: { gt: 0 }, // Only show products in stock
    };

    if (query.category) {
      where.category = { slug: query.category };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, slug: true, name: true },
          },
          images: {
            select: { id: true, url: true, sortOrder: true },
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
          seller: {
            select: {
              id: true,
              displayName: true,
              verificationStatus: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: query.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description
          ? p.description.slice(0, 200) + (p.description.length > 200 ? "..." : "")
          : null,
        priceAmount: p.priceAmount,
        currency: p.currency,
        stockQuantity: p.stockQuantity,
        category: p.category,
        thumbnail: p.images[0]?.url ?? null,
        seller: {
          id: p.seller.id,
          displayName: p.seller.displayName,
          verified: p.seller.verificationStatus === "VERIFIED",
        },
        createdAt: p.createdAt,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

