/**
 * POST /api/seller/onboard
 * Create seller profile + shop + default policies/profiles
 * This is the main onboarding endpoint for new sellers
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireAuth } from "@/lib/auth/require-auth";
import { onboardSellerSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { slugify, generateUniqueSlug } from "@/domain/value-objects/slug";
import { AppError, ErrorCodes } from "@/lib/api/errors";
import { AccountType } from "@prisma/client";

export const POST = withRequestContext(async (request: NextRequest, { requestId, logger }) => {
  const authContext = await requireAuth();

  // Check if already onboarded
  const existingProfile = await prisma.sellerProfile.findUnique({
    where: { userId: authContext.user.id },
    include: { shop: true },
  });

  if (existingProfile?.shop) {
    throw new AppError(
      ErrorCodes.ALREADY_EXISTS,
      "You already have a seller profile and shop",
      409
    );
  }

  const body = await request.json();
  const data = onboardSellerSchema.parse(body);

  // Generate shop slug
  const baseSlug = data.shopSlug || slugify(data.shopName);
  const existingSlugs = await prisma.shop
    .findMany({
      where: { shopSlug: { startsWith: baseSlug } },
      select: { shopSlug: true },
    })
    .then((shops) => shops.map((s) => s.shopSlug));

  const shopSlug = generateUniqueSlug(baseSlug, existingSlugs);

  // Create everything in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update user account type if needed
    if (authContext.user.accountType === "BUYER") {
      await tx.user.update({
        where: { id: authContext.user.id },
        data: { accountType: AccountType.BOTH },
      });
    }

    // Create default policies
    const policies = await tx.shopPolicies.create({
      data: {
        returnPolicyType: "RETURNS_ACCEPTED",
        returnWindowDays: 14,
      },
    });

    // Create shop
    const shop = await tx.shop.create({
      data: {
        ownerUserId: authContext.user.id,
        shopName: data.shopName,
        shopSlug,
        tagline: data.tagline,
        about: data.about,
        policiesId: policies.id,
      },
    });

    // Create or update seller profile
    const sellerProfile = existingProfile
      ? await tx.sellerProfile.update({
          where: { userId: authContext.user.id },
          data: { shopId: shop.id },
        })
      : await tx.sellerProfile.create({
          data: {
            userId: authContext.user.id,
            shopId: shop.id,
          },
        });

    // Create default processing profile
    await tx.processingProfile.create({
      data: {
        shopId: shop.id,
        name: "Standard",
        mode: "READY_TO_SHIP",
        minDays: 1,
        maxDays: 3,
        isDefault: true,
      },
    });

    // Create default shipping profile
    // MVP Decision: "Satıcı Öder" modeli - Kargo ücreti platform tarafından alıcıdan tahsil edilmez
    await tx.shippingProfile.create({
      data: {
        shopId: shop.id,
        name: "Standart Gönderim (Satıcı Öder)",
        originProvince: "İstanbul",
        rulesJson: {
          domestic: {
            basePriceMinor: 0, // 0 TL (Ücretsiz - Satıcı öder)
            additionalItemMinor: 0, // Ek ürün için ücret yok
            // freeAboveMinor alanına gerek yok çünkü zaten ücretsiz
          },
        },
        isDefault: true,
      },
    });

    return { shop, sellerProfile, policies };
  });

  logger.info("Seller onboarded successfully", {
    userId: authContext.user.id,
    shopId: result.shop.id,
    shopSlug: result.shop.shopSlug,
  });

  return NextResponse.json(
    {
      message: "Seller onboarding completed successfully",
      shop: {
        id: result.shop.id,
        shopName: result.shop.shopName,
        shopSlug: result.shop.shopSlug,
        tagline: result.shop.tagline,
        about: result.shop.about,
      },
      sellerProfile: {
        userId: result.sellerProfile.userId,
        verificationStatus: result.sellerProfile.verificationStatus,
      },
    },
    { status: 201, headers: { "x-request-id": requestId } }
  );
});

