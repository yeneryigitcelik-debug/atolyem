/**
 * Data access functions for listings
 */

import { prisma } from "@/lib/db/prisma";

export interface ListingCard {
  id: string;
  title: string;
  slug: string;
  price: number;
  thumbnail: string | null;
  artistName: string;
  artistSlug: string | null;
  favoriteCount: number;
}

/**
 * Get new listings ordered by creation date
 */
export async function getNewListings(limit: number = 8): Promise<ListingCard[]> {
  const listings = await prisma.listing.findMany({
    where: {
      status: "PUBLISHED",
      complianceStatus: { in: ["PENDING", "APPROVED"] },
      isPrivate: false,
    },
    include: {
      shop: {
        include: {
          sellerProfile: {
            include: {
              user: {
                include: {
                  publicProfile: true,
                },
              },
            },
          },
        },
      },
      media: {
        where: { isPrimary: true },
        take: 1,
      },
      _count: {
        select: { favorites: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return listings.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    price: l.basePriceMinor / 100,
    thumbnail: l.media[0]?.url ?? null,
    artistName: l.shop?.sellerProfile?.user?.publicProfile?.displayName || l.shop?.shopName || "Sanatçı",
    artistSlug: l.shop?.sellerProfile?.user?.publicProfile?.username || l.shop?.shopSlug || null,
    favoriteCount: l._count.favorites,
  }));
}

/**
 * Get popular listings ordered by favorite count
 */
export async function getPopularListings(limit: number = 8): Promise<ListingCard[]> {
  const listings = await prisma.listing.findMany({
    where: {
      status: "PUBLISHED",
      complianceStatus: { in: ["PENDING", "APPROVED"] },
      isPrivate: false,
    },
    include: {
      shop: {
        include: {
          sellerProfile: {
            include: {
              user: {
                include: {
                  publicProfile: true,
                },
              },
            },
          },
        },
      },
      media: {
        where: { isPrimary: true },
        take: 1,
      },
      _count: {
        select: { favorites: true },
      },
    },
    orderBy: [
      { favorites: { _count: "desc" } },
      { createdAt: "desc" },
    ],
    take: limit,
  });

  return listings.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    price: l.basePriceMinor / 100,
    thumbnail: l.media[0]?.url ?? null,
    artistName: l.shop?.sellerProfile?.user?.publicProfile?.displayName || l.shop?.shopName || "Sanatçı",
    artistSlug: l.shop?.sellerProfile?.user?.publicProfile?.username || l.shop?.shopSlug || null,
    favoriteCount: l._count.favorites,
  }));
}
