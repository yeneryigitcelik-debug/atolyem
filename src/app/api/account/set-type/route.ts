/**
 * POST /api/account/set-type
 * Update the user's account type (BUYER, SELLER, or BOTH).
 *
 * Rules:
 * - Cannot downgrade from SELLER/BOTH to BUYER if user has active (non-archived) listings
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { handleApiError, createErrorResponse } from "@/lib/api/errors";
import { setAccountTypeSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { AccountType, ProductStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const userContext = await requireUser();
    const body = await request.json();
    const { accountType } = setAccountTypeSchema.parse(body);

    const currentType = userContext.appUser.accountType;
    const newType = accountType as AccountType;

    // Check if downgrading from seller capability
    const isLosingSellerCapability =
      (currentType === AccountType.SELLER || currentType === AccountType.BOTH) &&
      newType === AccountType.BUYER;

    if (isLosingSellerCapability && userContext.sellerProfile) {
      // Check for active listings
      const activeListings = await prisma.product.count({
        where: {
          sellerId: userContext.sellerProfile.id,
          status: {
            in: [ProductStatus.DRAFT, ProductStatus.PUBLISHED],
          },
        },
      });

      if (activeListings > 0) {
        return createErrorResponse(
          "ACTIVE_LISTINGS_EXIST",
          `Cannot downgrade to BUYER while you have ${activeListings} active listing(s). Archive all listings first.`,
          400
        );
      }
    }

    // Update account type
    const updatedUser = await prisma.appUser.update({
      where: { id: userContext.appUser.id },
      data: { accountType: newType },
    });

    // If upgrading to seller capability and no preferences exist, create them
    if (
      (newType === AccountType.SELLER || newType === AccountType.BOTH) &&
      !userContext.preferences
    ) {
      await prisma.userPreferences.create({
        data: {
          userId: userContext.appUser.id,
          activeMode: "seller",
        },
      });
    }

    return NextResponse.json({
      message: "Account type updated successfully",
      accountType: updatedUser.accountType,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

