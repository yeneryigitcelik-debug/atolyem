/**
 * GET /api/seller/me
 * Get current seller's profile, shop, and stats
 */

import { NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";

export const GET = withRequestContext(async (request, { requestId }) => {
  const { user, sellerProfile } = await requireSeller();

  // Get shop with related data
  const shop = await prisma.shop.findUnique({
    where: { id: sellerProfile.shop.id },
    include: {
      policies: true,
      sections: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: {
          listings: { where: { status: "PUBLISHED" } },
          followers: true,
        },
      },
    },
  });

  // Get processing and shipping profiles
  const [processingProfiles, shippingProfiles] = await Promise.all([
    prisma.processingProfile.findMany({
      where: { shopId: sellerProfile.shop.id },
      orderBy: { isDefault: "desc" },
    }),
    prisma.shippingProfile.findMany({
      where: { shopId: sellerProfile.shop.id },
      orderBy: { isDefault: "desc" },
    }),
  ]);

  // Get recent order items for this seller
  const recentOrderItems = await prisma.orderItem.count({
    where: {
      sellerUserId: user.id,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        accountType: user.accountType,
      },
      sellerProfile: {
        verificationStatus: sellerProfile.verificationStatus,
        identityVerified: sellerProfile.identityVerified,
        subMerchantStatus: sellerProfile.subMerchantStatus,
      },
      shop: {
        id: shop!.id,
        shopName: shop!.shopName,
        shopSlug: shop!.shopSlug,
        tagline: shop!.tagline,
        about: shop!.about,
        bannerImageUrl: shop!.bannerImageUrl,
        logoImageUrl: shop!.logoImageUrl,
        websiteUrl: shop!.websiteUrl,
        instagramHandle: shop!.instagramHandle,
        isActive: shop!.isActive,
        policies: shop!.policies,
        sections: shop!.sections,
        stats: {
          publishedListings: shop!._count.listings,
          followers: shop!._count.followers,
          recentSales: recentOrderItems,
        },
      },
      processingProfiles,
      shippingProfiles,
    },
    { headers: { "x-request-id": requestId } }
  );
});

