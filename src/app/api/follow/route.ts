/**
 * GET /api/follow - Get user's followed shops
 * POST /api/follow - Follow a shop
 * DELETE /api/follow/:shopId - Unfollow a shop
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireAuth } from "@/lib/auth/require-auth";
import { followShopSchema, paginationSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { assertNotSelfFollow } from "@/application/integrity-rules/ownership-rules";
import { NotFoundError, AppError, ErrorCodes } from "@/lib/api/errors";

export const GET = withRequestContext(async (request: NextRequest, { requestId }) => {
  const { user } = await requireAuth();

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const { page, limit } = paginationSchema.parse(searchParams);

  const skip = (page - 1) * limit;

  const [follows, total] = await Promise.all([
    prisma.followShop.findMany({
      where: { userId: user.id },
      include: {
        shop: {
          include: {
            _count: {
              select: {
                listings: { where: { status: "PUBLISHED" } },
                followers: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.followShop.count({ where: { userId: user.id } }),
  ]);

  return NextResponse.json(
    {
      followedShops: follows
        .filter((f) => f.shop.isActive)
        .map((f) => ({
          shopId: f.shopId,
          shop: {
            id: f.shop.id,
            shopName: f.shop.shopName,
            shopSlug: f.shop.shopSlug,
            logoImageUrl: f.shop.logoImageUrl,
            listingCount: f.shop._count.listings,
            followerCount: f.shop._count.followers,
          },
          followedAt: f.createdAt,
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
  const data = followShopSchema.parse(body);

  // Get shop
  const shop = await prisma.shop.findUnique({
    where: { id: data.shopId },
    select: {
      id: true,
      ownerUserId: true,
      isActive: true,
    },
  });

  if (!shop) {
    throw new NotFoundError("Shop");
  }

  // Check not self-following
  assertNotSelfFollow(shop.ownerUserId, user.id);

  // Check shop is active
  if (!shop.isActive) {
    throw new AppError(
      ErrorCodes.NOT_FOUND,
      "This shop is not available",
      404
    );
  }

  // Check if already following
  const existing = await prisma.followShop.findUnique({
    where: {
      userId_shopId: {
        userId: user.id,
        shopId: data.shopId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { message: "Already following" },
      { headers: { "x-request-id": requestId } }
    );
  }

  await prisma.followShop.create({
    data: {
      userId: user.id,
      shopId: data.shopId,
    },
  });

  logger.info("Shop followed", { shopId: data.shopId });

  return NextResponse.json(
    { message: "Now following shop" },
    { status: 201, headers: { "x-request-id": requestId } }
  );
});

export const DELETE = withRequestContext(async (request: NextRequest, { requestId, logger }) => {
  const { user } = await requireAuth();

  const url = new URL(request.url);
  const shopId = url.searchParams.get("shopId");

  if (!shopId) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, "shopId is required", 400);
  }

  await prisma.followShop.deleteMany({
    where: {
      userId: user.id,
      shopId,
    },
  });

  logger.info("Shop unfollowed", { shopId });

  return NextResponse.json(
    { message: "Unfollowed shop" },
    { headers: { "x-request-id": requestId } }
  );
});

