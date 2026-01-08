/**
 * POST /api/listings - Create a new listing (draft)
 * GET /api/listings - Search public listings
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller, optionalAuth } from "@/lib/auth/require-auth";
import { createListingSchema, listingSearchSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { slugify, generateUniqueSlug } from "@/domain/value-objects/slug";
import { assertValidTags } from "@/application/integrity-rules/tag-rules";
import { checkListingLimit } from "@/lib/subscription/utils";
import { AppError, ErrorCodes } from "@/lib/api/errors";

export const POST = withRequestContext(async (request: NextRequest, { requestId, logger }) => {
  const { user, sellerProfile } = await requireSeller();

  // Check subscription and listing limit
  const limitCheck = await checkListingLimit(user.id);
  if (!limitCheck.canCreate) {
    throw new AppError(
      ErrorCodes.VALIDATION_ERROR,
      limitCheck.reason || "Ürün ekleme limitinize ulaştınız",
      403
    );
  }

  const body = await request.json();
  const data = createListingSchema.parse(body);

  // Validate and normalize tags
  const tags = data.tags ? assertValidTags(data.tags) : [];

  // Generate unique slug from title
  const baseSlug = slugify(data.title);
  const existingSlugs = await prisma.listing
    .findMany({
      where: { slug: { startsWith: baseSlug } },
      select: { slug: true },
    })
    .then((listings) => listings.map((l) => l.slug));

  const slug = generateUniqueSlug(baseSlug, existingSlugs);

  // Create listing with tags and attributes
  const listing = await prisma.listing.create({
    data: {
      shopId: sellerProfile.shop.id,
      sellerUserId: user.id,
      listingType: data.listingType,
      title: data.title,
      slug,
      description: data.description,
      basePriceMinor: data.basePriceMinor,
      currency: data.currency,
      baseQuantity: data.baseQuantity,
      sectionId: data.sectionId,
      processingProfileId: data.processingProfileId,
      shippingProfileId: data.shippingProfileId,
      vintageYear: data.vintageYear,
      vintageDecade: data.vintageDecade,
      vintageEvidenceNote: data.vintageEvidenceNote,
      isHandmadeClaimed: data.isHandmadeClaimed,
      isAiGenerated: data.isAiGenerated,
      returnPolicyType: data.returnPolicyType,
      returnWindowDays: data.returnWindowDays,
      tags: {
        create: tags.map((tag) => ({ tag })),
      },
      attributes: {
        create: data.attributes?.map((attr) => ({
          key: attr.key,
          value: attr.value,
        })),
      },
    },
    include: {
      tags: true,
      attributes: true,
    },
  });

  logger.info("Listing created", {
    listingId: listing.id,
    shopId: sellerProfile.shop.id,
    listingType: listing.listingType,
  });

  return NextResponse.json(
    {
      message: "Listing created successfully",
      listing: {
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        status: listing.status,
        listingType: listing.listingType,
        basePriceMinor: listing.basePriceMinor,
        currency: listing.currency,
        baseQuantity: listing.baseQuantity,
        tags: listing.tags.map((t) => t.tag),
        attributes: listing.attributes,
        createdAt: listing.createdAt,
      },
    },
    { status: 201, headers: { "x-request-id": requestId } }
  );
});

export const GET = withRequestContext(async (request: NextRequest, { requestId }) => {
  const authContext = await optionalAuth();
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const query = listingSearchSchema.parse(searchParams);

  const skip = (query.page - 1) * query.limit;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: "PUBLISHED",
    complianceStatus: { in: ["PENDING", "APPROVED"] },
    isPrivate: false,
  };

  if (query.type) {
    where.listingType = query.type;
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.basePriceMinor = {};
    if (query.minPrice !== undefined) {
      where.basePriceMinor.gte = query.minPrice;
    }
    if (query.maxPrice !== undefined) {
      where.basePriceMinor.lte = query.maxPrice;
    }
  }

  if (query.tags) {
    const tagList = query.tags.split(",").map((t) => t.trim().toLowerCase());
    where.tags = {
      some: {
        tag: { in: tagList },
      },
    };
  }

  if (query.shopSlug) {
    where.shop = { shopSlug: query.shopSlug };
  }

  // Determine sort order
  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (query.sortBy === "price_asc") {
    orderBy = { basePriceMinor: "asc" };
  } else if (query.sortBy === "price_desc") {
    orderBy = { basePriceMinor: "desc" };
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        shop: {
          select: { id: true, shopName: true, shopSlug: true },
        },
        media: {
          where: { isPrimary: true },
          take: 1,
        },
        _count: {
          select: { favorites: true, reviews: true },
        },
      },
      orderBy,
      skip,
      take: query.limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json(
    {
      listings: listings.map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        listingType: l.listingType,
        basePriceMinor: l.basePriceMinor,
        currency: l.currency,
        baseQuantity: l.baseQuantity,
        shop: l.shop,
        thumbnail: l.media[0]?.url ?? null,
        favoriteCount: l._count.favorites,
        reviewCount: l._count.reviews,
        createdAt: l.createdAt,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

