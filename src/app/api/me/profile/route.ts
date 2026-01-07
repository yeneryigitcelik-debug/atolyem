/**
 * GET /api/me/profile - Get current user's public profile
 * PATCH /api/me/profile - Update current user's public profile
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";
import { updateProfileSettingsSchema } from "@/lib/api/validation";

export const GET = withRequestContext(async (request: NextRequest, { requestId }) => {
  const { user, publicProfile, sellerProfile } = await requireAuth();

  if (!publicProfile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404, headers: { "x-request-id": requestId } }
    );
  }

  // Get stats
  const [favoritesCount, followingCount, followersCount, reviewsCount] = await Promise.all([
    prisma.favoriteListing.count({ where: { userId: user.id } }),
    prisma.followShop.count({ where: { userId: user.id } }),
    prisma.userFollow.count({ where: { followingId: user.id } }),
    prisma.review.count({ where: { buyerUserId: user.id } }),
  ]);

  // Get badges
  const badges = await prisma.userBadge.findMany({
    where: { userId: user.id, isDisplayed: true },
    include: { badge: true },
  });

  return NextResponse.json(
    {
      profile: {
        username: publicProfile.username,
        displayName: publicProfile.displayName,
        bio: publicProfile.bio,
        avatarUrl: publicProfile.avatarUrl || user.avatarUrl,
        bannerUrl: publicProfile.bannerUrl,
        location: publicProfile.location,
        websiteUrl: publicProfile.websiteUrl,
        instagramHandle: publicProfile.instagramHandle,
        isPublic: publicProfile.isPublic,
        showFavorites: publicProfile.showFavorites,
        memberSince: user.createdAt,
        accountType: user.accountType,
        isArtist: user.accountType === "SELLER" || user.accountType === "BOTH",
        hasShop: !!sellerProfile?.shop,
        shopSlug: sellerProfile?.shop?.shopSlug || null,
        stats: {
          favorites: favoritesCount,
          following: followingCount,
          followers: followersCount,
          reviews: reviewsCount,
        },
        badges: badges.map((ub) => ({
          name: ub.badge.name,
          description: ub.badge.description,
          iconName: ub.badge.iconName,
          color: ub.badge.color,
          earnedAt: ub.earnedAt,
        })),
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

export const PATCH = withRequestContext(async (request: NextRequest, { requestId, logger }) => {
  const { user, publicProfile } = await requireAuth();

  if (!publicProfile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404, headers: { "x-request-id": requestId } }
    );
  }

  const body = await request.json();
  const data = updateProfileSettingsSchema.parse(body);

  // Normalize username to lowercase if provided
  const normalizedUsername = data.username?.toLowerCase();

  // Check username uniqueness if changed (case-insensitive)
  if (normalizedUsername && normalizedUsername !== publicProfile.username.toLowerCase()) {
    const existingProfile = await prisma.publicProfile.findFirst({
      where: {
        username: {
          equals: normalizedUsername,
          mode: "insensitive",
        },
      },
    });
    if (existingProfile) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten alınmış", code: "USERNAME_TAKEN" },
        { status: 409, headers: { "x-request-id": requestId } }
      );
    }
  }

  const updatedProfile = await prisma.publicProfile.update({
    where: { userId: user.id },
    data: {
      displayName: data.displayName,
      username: normalizedUsername,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      bannerUrl: data.bannerUrl,
      location: data.location,
      websiteUrl: data.websiteUrl || null,
      instagramHandle: data.instagramHandle,
      isPublic: data.isPublic,
      showFavorites: data.showFavorites,
    },
  });

  // Also update user's avatarUrl and displayName if changed
  if (data.avatarUrl !== undefined || data.displayName !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
      },
    });
  }

  logger.info("Profile updated", { userId: user.id, username: updatedProfile.username });

  return NextResponse.json(
    {
      message: "Profil başarıyla güncellendi",
      profile: {
        username: updatedProfile.username,
        displayName: updatedProfile.displayName,
        bio: updatedProfile.bio,
        avatarUrl: updatedProfile.avatarUrl,
        bannerUrl: updatedProfile.bannerUrl,
        location: updatedProfile.location,
        websiteUrl: updatedProfile.websiteUrl,
        instagramHandle: updatedProfile.instagramHandle,
        isPublic: updatedProfile.isPublic,
        showFavorites: updatedProfile.showFavorites,
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

