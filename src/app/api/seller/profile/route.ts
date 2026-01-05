/**
 * POST /api/seller/profile - Create seller profile (for SELLER/BOTH account types)
 * GET /api/seller/profile - Get current user's seller profile
 * PATCH /api/seller/profile - Update seller profile
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { requireCapability } from "@/lib/auth/requireCapability";
import { handleApiError, createErrorResponse } from "@/lib/api/errors";
import {
  createSellerProfileSchema,
  updateSellerProfileSchema,
} from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const userContext = await requireUser();
    requireCapability(userContext, "SELLER");

    if (!userContext.sellerProfile) {
      return createErrorResponse(
        "NO_SELLER_PROFILE",
        "You haven't created a seller profile yet",
        404
      );
    }

    return NextResponse.json({
      sellerProfile: {
        id: userContext.sellerProfile.id,
        displayName: userContext.sellerProfile.displayName,
        bio: userContext.sellerProfile.bio,
        verificationStatus: userContext.sellerProfile.verificationStatus,
        createdAt: userContext.sellerProfile.createdAt,
        updatedAt: userContext.sellerProfile.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await requireUser();
    requireCapability(userContext, "SELLER");

    // Check if seller profile already exists
    if (userContext.sellerProfile) {
      return createErrorResponse(
        "PROFILE_EXISTS",
        "You already have a seller profile",
        409
      );
    }

    const body = await request.json();
    const data = createSellerProfileSchema.parse(body);

    const sellerProfile = await prisma.sellerProfile.create({
      data: {
        userId: userContext.appUser.id,
        displayName: data.displayName,
        bio: data.bio ?? null,
      },
    });

    return NextResponse.json(
      {
        message: "Seller profile created successfully",
        sellerProfile: {
          id: sellerProfile.id,
          displayName: sellerProfile.displayName,
          bio: sellerProfile.bio,
          verificationStatus: sellerProfile.verificationStatus,
          createdAt: sellerProfile.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userContext = await requireUser();
    requireCapability(userContext, "SELLER");

    if (!userContext.sellerProfile) {
      return createErrorResponse(
        "NO_SELLER_PROFILE",
        "You haven't created a seller profile yet",
        404
      );
    }

    const body = await request.json();
    const data = updateSellerProfileSchema.parse(body);

    const sellerProfile = await prisma.sellerProfile.update({
      where: { id: userContext.sellerProfile.id },
      data: {
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
    });

    return NextResponse.json({
      message: "Seller profile updated successfully",
      sellerProfile: {
        id: sellerProfile.id,
        displayName: sellerProfile.displayName,
        bio: sellerProfile.bio,
        verificationStatus: sellerProfile.verificationStatus,
        updatedAt: sellerProfile.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

