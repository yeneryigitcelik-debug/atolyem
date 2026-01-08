/**
 * GET /api/artists - Get list of artists (sellers)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";

    // Get sellers with their shops and listing counts
    const sellers = await prisma.sellerProfile.findMany({
      where: {
        shop: {
          isNot: null,
        },
      },
      include: {
        user: {
          include: {
            publicProfile: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
              },
            },
          },
        },
        shop: {
          select: {
            id: true,
            shopName: true,
            shopSlug: true,
            tagline: true,
            logoImageUrl: true,
            _count: {
              select: {
                listings: {
                  where: { status: "PUBLISHED" },
                },
              },
            },
          },
        },
      },
      take: limit,
    });

    // Filter sellers that have at least one published listing
    const artistsWithListings = sellers.filter(
      (s) => s.shop && s.shop._count.listings > 0
    );

    // Transform to response format
    const artists = artistsWithListings.map((seller) => ({
      id: seller.userId,
      name: seller.shop?.shopName || seller.user.publicProfile?.displayName || "Sanatçı",
      username: seller.user.publicProfile?.username,
      specialty: seller.shop?.tagline || "Sanatçı",
      slug: seller.user.publicProfile?.username || seller.shop?.shopSlug,
      image: seller.shop?.logoImageUrl || seller.user.publicProfile?.avatarUrl,
      works: seller.shop?._count.listings || 0,
      bio: seller.user.publicProfile?.bio,
    }));

    // Sort by number of works descending
    artists.sort((a, b) => b.works - a.works);

    // Featured artists are top 3 by works
    const featuredArtists = artists.slice(0, 3).map(a => ({ ...a, featured: true }));

    return NextResponse.json({
      artists: featured ? featuredArtists : artists,
      total: artists.length,
    });
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

