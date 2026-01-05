/**
 * POST /api/account/set-mode
 * Update the user's active mode preference (buyer or seller).
 *
 * This is purely a UI preference and does NOT change permissions.
 * - Seller mode requires SELLER or BOTH account type
 * - Buyer mode requires BUYER or BOTH account type
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { handleApiError, createErrorResponse } from "@/lib/api/errors";
import { setActiveModeSchema } from "@/lib/api/validation";
import { canUseBuyerMode, canUseSellerMode } from "@/lib/auth/requireCapability";
import { prisma } from "@/lib/db/prisma";
import { ActiveMode } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const userContext = await requireUser();
    const body = await request.json();
    const { activeMode } = setActiveModeSchema.parse(body);

    // Validate mode is allowed for this account type
    if (activeMode === "seller" && !canUseSellerMode(userContext)) {
      return createErrorResponse(
        "SELLER_MODE_NOT_ALLOWED",
        "Your account type does not allow seller mode. Upgrade to SELLER or BOTH first.",
        403
      );
    }

    if (activeMode === "buyer" && !canUseBuyerMode(userContext)) {
      return createErrorResponse(
        "BUYER_MODE_NOT_ALLOWED",
        "Your account type does not allow buyer mode. Upgrade to BUYER or BOTH first.",
        403
      );
    }

    // Upsert preferences with the new active mode
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: userContext.appUser.id },
      create: {
        userId: userContext.appUser.id,
        activeMode: activeMode as ActiveMode,
      },
      update: {
        activeMode: activeMode as ActiveMode,
      },
    });

    return NextResponse.json({
      message: "Active mode updated successfully",
      activeMode: preferences.activeMode,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

