/**
 * GET /api/favorites - Get user's favorite listings
 * POST /api/favorites - Add listing to favorites
 * DELETE /api/favorites/:listingId - Remove from favorites
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireAuth } from "@/lib/auth/require-auth";
import { favoriteListingSchema, paginationSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { assertNotSelfFavorite } from "@/application/integrity-rules/ownership-rules";
import { NotFoundError, AppError, ErrorCodes } from "@/lib/api/errors";

export const GET = withRequestContext(async (request: NextRequest, { requestId }) => {
  const { user } = await requireAuth();

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const { page, limit } = paginationSchema.parse(searchParams);

  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    prisma.favoriteListing.findMany({
      where: { userId: user.id },
      include: {
        listing: {
          include: {
            shop: { select: { id: true, shopName: true, shopSlug: true } },
            media: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.favoriteListing.count({ where: { userId: user.id } }),
  ]);

  return NextResponse.json(
    {
      favorites: favorites
        .filter((f) => f.listing.status === "PUBLISHED") // Only show published
        .map((f) => ({
          listingId: f.listingId,
          listing: {
            id: f.listing.id,
            title: f.listing.title,
            slug: f.listing.slug,
            basePriceMinor: f.listing.basePriceMinor,
            currency: f.listing.currency,
            shop: f.listing.shop,
            thumbnail: f.listing.media[0]?.url ?? null,
          },
          favoritedAt: f.createdAt,
        })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

export const POST = withRequestContext(async (request: NextRequest, { requestId, logger }) => {
  const { user } = await requireAuth();

  const body = await request.json();
  const data = favoriteListingSchema.parse(body);

  // Get listing
  const listing = await prisma.listing.findUnique({
    where: { id: data.listingId },
    select: {
      id: true,
      sellerUserId: true,
      status: true,
    },
  });

  if (!listing) {
    throw new NotFoundError("Listing");
  }

  // Check not self-favoriting
  assertNotSelfFavorite(listing.sellerUserId, user.id);

  // Check listing is published
  if (listing.status !== "PUBLISHED") {
    throw new AppError(
      ErrorCodes.LISTING_NOT_AVAILABLE,
      "You can only favorite published listings",
      400
    );
  }

  // Check if already favorited
  const existing = await prisma.favoriteListing.findUnique({
    where: {
      userId_listingId: {
        userId: user.id,
        listingId: data.listingId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { message: "Already in favorites" },
      { headers: { "x-request-id": requestId } }
    );
  }

  await prisma.favoriteListing.create({
    data: {
      userId: user.id,
      listingId: data.listingId,
    },
  });

  logger.info("Listing favorited", { listingId: data.listingId });

  return NextResponse.json(
    { message: "Added to favorites" },
    { status: 201, headers: { "x-request-id": requestId } }
  );
});

export const DELETE = withRequestContext(async (request: NextRequest, { requestId, logger }) => {
  const { user } = await requireAuth();

  const url = new URL(request.url);
  const listingId = url.searchParams.get("listingId");

  if (!listingId) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, "listingId is required", 400);
  }

  await prisma.favoriteListing.deleteMany({
    where: {
      userId: user.id,
      listingId,
    },
  });

  logger.info("Listing unfavorited", { listingId });

  return NextResponse.json(
    { message: "Removed from favorites" },
    { headers: { "x-request-id": requestId } }
  );
});

