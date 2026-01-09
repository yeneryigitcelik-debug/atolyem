/**
 * GET /api/seller/listings - Get current seller's listings with filters
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { ListingStatus, Prisma } from "@prisma/client";

const sellerListingsQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "REMOVED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const GET = withRequestContext(async (request: NextRequest, { requestId }) => {
  const { user } = await requireSeller();

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const query = sellerListingsQuerySchema.parse(searchParams);

  const skip = (query.page - 1) * query.limit;

  // Build where clause with proper types
  const where: Prisma.ListingWhereInput = {
    sellerUserId: user.id,
  };

  if (query.status) {
    where.status = query.status as ListingStatus;
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        media: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        _count: {
          select: {
            favorites: true,
            reviews: true,
            orderItems: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json(
    {
      listings: listings.map((l) => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        status: l.status,
        listingType: l.listingType,
        basePriceMinor: l.basePriceMinor,
        currency: l.currency,
        baseQuantity: l.baseQuantity,
        thumbnail: l.media[0]?.url ?? null,
        favoriteCount: l._count.favorites,
        reviewCount: l._count.reviews,
        orderCount: l._count.orderItems,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
        publishedAt: l.publishedAt,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});




