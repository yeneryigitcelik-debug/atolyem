/**
 * Authentication Guards
 * Unified auth checks for API routes
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { UnauthorizedError, ForbiddenError, AppError, ErrorCodes } from "@/lib/api/errors";
import type { User, SellerProfile, Shop, PublicProfile } from "@prisma/client";

export interface AuthContext {
  supabaseUserId: string;
  user: User;
  publicProfile: PublicProfile | null;
  sellerProfile: (SellerProfile & { shop: Shop | null }) | null;
}

/**
 * Generate a unique username from email or name
 */
function generateUsername(email: string, fullName?: string | null): string {
  // Try to use name first, fallback to email prefix
  let base = fullName 
    ? fullName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
    : email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
  
  // Ensure minimum length
  if (base.length < 3) {
    base = `user-${base}`;
  }
  
  // Add random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

/**
 * Get authenticated user context
 * @throws UnauthorizedError if not authenticated
 */
export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user: supabaseUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !supabaseUser) {
    throw new UnauthorizedError();
  }

  // Get or create user in our database
  let user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });

  if (!user) {
    // Create user on first access
    user = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        displayName: supabaseUser.user_metadata?.full_name ?? null,
        phone: supabaseUser.phone ?? null,
      },
    });
  }

  // Get or create public profile
  let publicProfile = await prisma.publicProfile.findUnique({
    where: { userId: user.id },
  });

  if (!publicProfile) {
    // Generate unique username
    let username = generateUsername(user.email, user.displayName);
    
    // Ensure username is unique
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.publicProfile.findUnique({
        where: { username },
      });
      if (!existing) break;
      username = generateUsername(user.email, user.displayName);
      attempts++;
    }

    // Create public profile for all users
    publicProfile = await prisma.publicProfile.create({
      data: {
        userId: user.id,
        username,
        displayName: user.displayName || user.email.split("@")[0],
        isPublic: true,
      },
    });
  }

  // Get seller profile if exists
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: user.id },
    include: { shop: true },
  });

  return {
    supabaseUserId: supabaseUser.id,
    user,
    publicProfile,
    sellerProfile,
  };
}

/**
 * Require user to have seller capability (SELLER or BOTH account type)
 * @throws ForbiddenError if not a seller
 */
export async function requireSeller(): Promise<AuthContext & { sellerProfile: SellerProfile & { shop: Shop } }> {
  const context = await requireAuth();

  if (
    context.user.accountType !== "SELLER" &&
    context.user.accountType !== "BOTH"
  ) {
    throw new ForbiddenError("Seller account required");
  }

  if (!context.sellerProfile) {
    throw new AppError(
      ErrorCodes.SELLER_PROFILE_REQUIRED,
      "You must complete seller onboarding first",
      403
    );
  }

  if (!context.sellerProfile.shop) {
    throw new AppError(
      ErrorCodes.SHOP_REQUIRED,
      "You must create a shop first",
      403
    );
  }

  return {
    ...context,
    sellerProfile: context.sellerProfile as SellerProfile & { shop: Shop },
  };
}

/**
 * Require user to have buyer capability (BUYER or BOTH account type)
 * @throws ForbiddenError if not a buyer
 */
export async function requireBuyer(): Promise<AuthContext> {
  const context = await requireAuth();

  if (
    context.user.accountType !== "BUYER" &&
    context.user.accountType !== "BOTH"
  ) {
    throw new ForbiddenError("Buyer account required");
  }

  return context;
}

/**
 * Require admin access
 * @throws ForbiddenError if not admin
 */
export async function requireAdmin(): Promise<AuthContext> {
  const context = await requireAuth();

  if (!context.user.isAdmin) {
    throw new ForbiddenError("Admin access required");
  }

  return context;
}

/**
 * Optional auth - returns null if not authenticated
 */
export async function optionalAuth(): Promise<AuthContext | null> {
  try {
    return await requireAuth();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return null;
    }
    throw error;
  }
}

