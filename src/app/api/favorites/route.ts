/**
 * GET /api/favorites - Get current user's own favorites
 * DELETE /api/favorites - Remove a listing from favorites
 * POST /api/favorites - Add a listing to favorites
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favoriteListing.findMany({
      where: { userId: user.id },
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
                ownerUserId: true,
              },
            },
            media: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
            tags: {
              take: 1,
              select: { tag: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get shop owner usernames in batch
    const shopOwnerIds = [...new Set(
      favorites
        .map((f) => f.listing.shop?.ownerUserId)
        .filter((id): id is string => !!id)
    )];
    const shopOwners = await prisma.user.findMany({
      where: { id: { in: shopOwnerIds } },
      include: {
        publicProfile: {
          select: { username: true },
        },
      },
    });
    const ownerUsernameMap = new Map(
      shopOwners.map((u) => [u.id, u.publicProfile?.username ?? null])
    );

    // Filter to only include published listings
    const publishedFavorites = favorites.filter((f) => f.listing.status === "PUBLISHED");

    return NextResponse.json({
      favorites: publishedFavorites.map((f) => ({
        listingId: f.listingId,
        title: f.listing.title,
        slug: f.listing.slug,
        price: f.listing.basePriceMinor / 100,
        currency: f.listing.currency,
        image: f.listing.media[0]?.url ?? null,
        artist: f.listing.shop?.shopName ?? "Bilinmeyen",
        artistSlug: f.listing.shop?.ownerUserId 
          ? ownerUsernameMap.get(f.listing.shop.ownerUserId) 
          : null,
        badge: f.listing.tags[0]?.tag ?? null,
        favoritedAt: f.createdAt,
      })),
      total: publishedFavorites.length,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    // Check if listing exists and is published
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true },
    });

    if (!listing || listing.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Check if already favorited
    const existing = await prisma.favoriteListing.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Already in favorites" }, { status: 200 });
    }

    // Add to favorites
    const favorite = await prisma.favoriteListing.create({
      data: {
        userId: user.id,
        listingId,
      },
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    await prisma.favoriteListing.deleteMany({
      where: {
        userId: user.id,
        listingId,
      },
    });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
