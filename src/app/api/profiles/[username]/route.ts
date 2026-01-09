/**
 * GET /api/profiles/[username] - Get public profile by username
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    // Try exact match first
    let profile = await prisma.publicProfile.findUnique({
      where: { username },
      select: {
        userId: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        bannerUrl: true,
        location: true,
        websiteUrl: true,
        instagramHandle: true,
        isPublic: true,
        showFavorites: true,
        user: {
          select: {
            accountType: true,
            createdAt: true,
            sellerProfile: {
              select: {
                shop: {
                  select: {
                    shopSlug: true,
                    shopName: true,
                  },
                },
              },
            },
            _count: {
              select: {
                favorites: true,
                followedShops: true,
                reviews: true,
                following: true,
                followers: true,
              },
            },
          },
        },
        badges: {
          where: { isDisplayed: true },
          select: {
            badge: {
              select: {
                name: true,
                iconName: true,
                color: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // If not found, try case-insensitive lookup
    if (!profile) {
      const normalizedUsername = username.toLowerCase();
      profile = await prisma.publicProfile.findFirst({
        where: {
          username: {
            equals: normalizedUsername,
            mode: "insensitive",
          },
        },
        select: {
          userId: true,
          username: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          bannerUrl: true,
          location: true,
          websiteUrl: true,
          instagramHandle: true,
          isPublic: true,
          showFavorites: true,
          user: {
            select: {
              accountType: true,
              createdAt: true,
              sellerProfile: {
                select: {
                  shop: {
                    select: {
                      shopSlug: true,
                      shopName: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  favorites: true,
                  followedShops: true,
                  reviews: true,
                  following: true,
                  followers: true,
                },
              },
            },
          },
          badges: {
            where: { isDisplayed: true },
            select: {
              badge: {
                select: {
                  name: true,
                  iconName: true,
                  color: true,
                  description: true,
                },
              },
            },
          },
        },
      });
    }

    if (!profile || !profile.isPublic) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Format the response
    const isArtist = profile.user.accountType === "SELLER" || profile.user.accountType === "BOTH";
    const shop = profile.user.sellerProfile?.shop;
    
    const formattedProfile = {
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      bannerUrl: profile.bannerUrl,
      location: profile.location,
      websiteUrl: profile.websiteUrl,
      instagramHandle: profile.instagramHandle,
      isArtist,
      memberSince: profile.user.createdAt,
      showFavorites: profile.showFavorites ?? true,
      // Include shop info for artists
      shopSlug: shop?.shopSlug ?? null,
      shopName: shop?.shopName ?? null,
      stats: {
        favorites: profile.user._count.favorites,
        following: profile.user._count.followedShops + profile.user._count.following,
        followers: profile.user._count.followers,
        reviews: profile.user._count.reviews,
      },
      badges: profile.badges.map((ub) => ({
        name: ub.badge.name,
        icon: ub.badge.iconName,
        color: ub.badge.color,
        description: ub.badge.description,
      })),
    };

    return NextResponse.json({ profile: formattedProfile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
