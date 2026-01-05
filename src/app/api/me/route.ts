/**
 * GET /api/me
 * Returns the authenticated user's full profile including app_user, preferences, and seller profile.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { handleApiError } from "@/lib/api/errors";

export async function GET() {
  try {
    const userContext = await requireUser();

    return NextResponse.json({
      user: {
        id: userContext.appUser.id,
        email: userContext.appUser.email,
        phone: userContext.appUser.phone,
        fullName: userContext.appUser.fullName,
        accountType: userContext.appUser.accountType,
        createdAt: userContext.appUser.createdAt,
        updatedAt: userContext.appUser.updatedAt,
      },
      preferences: userContext.preferences
        ? {
            activeMode: userContext.preferences.activeMode,
            locale: userContext.preferences.locale,
            currency: userContext.preferences.currency,
          }
        : null,
      sellerProfile: userContext.sellerProfile
        ? {
            id: userContext.sellerProfile.id,
            displayName: userContext.sellerProfile.displayName,
            bio: userContext.sellerProfile.bio,
            verificationStatus: userContext.sellerProfile.verificationStatus,
            createdAt: userContext.sellerProfile.createdAt,
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

