/**
 * GET /api/users/[userId]/favorites - Get user's public favorites (if showFavorites enabled)
 * 
 * This endpoint is for PUBLIC viewing of a user's favorites on their profile.
 * It checks the user's showFavorites privacy setting before returning data.
 * 
 * For the user's own private favorites management, use /api/favorites instead.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { paginationSchema } from "@/lib/api/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { page, limit } = paginationSchema.parse(searchParams);

    const skip = (page - 1) * limit;

    // Check user exists and get their privacy settings
    const profile = await prisma.publicProfile.findUnique({
      where: { userId },
      select: {
        showFavorites: true,
        isPublic: true,
        username: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // If profile is not public or showFavorites is disabled, return empty/forbidden
    if (!profile.isPublic) {
      return NextResponse.json({ error: "Bu profil gizli" }, { status: 403 });
    }

    if (!profile.showFavorites) {
      return NextResponse.json({ 
        error: "Bu kullanıcı favorilerini gizli tutmayı tercih etti",
        showFavorites: false 
      }, { status: 403 });
    }

    const [favorites, total] = await Promise.all([
      prisma.favoriteListing.findMany({
        where: { userId },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              slug: true,
              basePriceMinor: true,
              currency: true,
              status: true,
              shop: {
                select: {
                  id: true,
                  shopName: true,
                  shopSlug: true,
                },
              },
              media: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.favoriteListing.count({ where: { userId } }),
    ]);

    // Filter to only include published listings
    const publishedFavorites = favorites.filter((f) => f.listing.status === "PUBLISHED");

    return NextResponse.json({
      favorites: publishedFavorites.map((f) => ({
        listingId: f.listingId,
        listing: {
          id: f.listing.id,
          title: f.listing.title,
          slug: f.listing.slug,
          basePriceMinor: f.listing.basePriceMinor,
          currency: f.listing.currency,
          shop: f.listing.shop,
          thumbnail: f.listing.media[0]?.url ?? null,
        },
        favoritedAt: f.createdAt,
      })),
      pagination: {
        page,
        limit,
        total: publishedFavorites.length,
        totalPages: Math.ceil(total / limit),
      },
      showFavorites: true,
    });
  } catch (error) {
    console.error("Error fetching public favorites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

