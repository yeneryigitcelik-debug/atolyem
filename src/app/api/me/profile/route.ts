/**
 * GET /api/me/profile - Get current user's public profile
 * PATCH /api/me/profile - Update current user's public profile
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  username: z.string().min(3).max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid username format").optional(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  websiteUrl: z.string().url().max(200).optional().nullable().or(z.literal("")),
  instagramHandle: z.string().max(30).optional().nullable(),
  isPublic: z.boolean().optional(),
});

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
  const data = updateProfileSchema.parse(body);

  // Check username uniqueness if changed
  if (data.username && data.username !== publicProfile.username) {
    const existingProfile = await prisma.publicProfile.findUnique({
      where: { username: data.username },
    });
    if (existingProfile) {
      return NextResponse.json(
        { error: "This username is already taken" },
        { status: 409, headers: { "x-request-id": requestId } }
      );
    }
  }

  const updatedProfile = await prisma.publicProfile.update({
    where: { userId: user.id },
    data: {
      displayName: data.displayName,
      username: data.username,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      bannerUrl: data.bannerUrl,
      location: data.location,
      websiteUrl: data.websiteUrl || null,
      instagramHandle: data.instagramHandle,
      isPublic: data.isPublic,
    },
  });

  // Also update user's avatarUrl if avatar changed
  if (data.avatarUrl !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: data.avatarUrl },
    });
  }

  logger.info("Profile updated", { userId: user.id, username: updatedProfile.username });

  return NextResponse.json(
    {
      message: "Profile updated successfully",
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
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

