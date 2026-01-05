/**
 * GET /api/listings/:slug - Get listing details (public if published)
 * PATCH /api/listings/:slug - Update listing (owner only)
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller, optionalAuth } from "@/lib/auth/require-auth";
import { updateListingSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { assertCanViewListing, assertCanEditListing } from "@/application/integrity-rules/visibility-rules";
import { NotFoundError } from "@/lib/api/errors";

type RouteParams = { slug: string };

export const GET = withRequestContext<RouteParams>(async (request, { requestId, params }) => {
  const authContext = await optionalAuth();
  const { slug } = params!;

  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      shop: {
        select: {
          id: true,
          shopName: true,
          shopSlug: true,
          logoImageUrl: true,
          policies: true,
        },
      },
      media: { orderBy: { sortOrder: "asc" } },
      tags: true,
      attributes: true,
      variationGroups: {
        include: {
          options: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        where: { isActive: true },
        include: {
          selections: {
            include: { option: { include: { group: true } } },
          },
        },
      },
      personalizationFields: { orderBy: { sortOrder: "asc" } },
      processingProfile: true,
      shippingProfile: true,
      digitalAsset: {
        select: {
          id: true,
          deliveryMode: true,
          fileName: true,
          fileType: true,
          fileSizeBytes: true,
        },
      },
      _count: {
        select: { favorites: true, reviews: true },
      },
    },
  });

  if (!listing) {
    throw new NotFoundError("Listing");
  }

  // Check visibility
  const privateAccessUserIds = listing.isPrivate
    ? await prisma.privateListingAccess
        .findMany({
          where: { listingId: listing.id },
          select: { userId: true },
        })
        .then((access) => access.map((a) => a.userId))
    : [];

  assertCanViewListing(
    {
      listingId: listing.id,
      status: listing.status,
      sellerUserId: listing.sellerUserId,
      isPrivate: listing.isPrivate,
      privateAccessUserIds,
    },
    {
      userId: authContext?.user.id,
      isAdmin: authContext?.user.isAdmin,
    }
  );

  // Check if current user has favorited
  let isFavorited = false;
  if (authContext) {
    const favorite = await prisma.favoriteListing.findUnique({
      where: {
        userId_listingId: {
          userId: authContext.user.id,
          listingId: listing.id,
        },
      },
    });
    isFavorited = !!favorite;
  }

  // Get average rating
  const reviewStats = await prisma.review.aggregate({
    where: { listingId: listing.id, isPublic: true },
    _avg: { rating: true },
    _count: true,
  });

  return NextResponse.json(
    {
      listing: {
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        description: listing.description,
        listingType: listing.listingType,
        status: listing.status,
        basePriceMinor: listing.basePriceMinor,
        currency: listing.currency,
        baseQuantity: listing.baseQuantity,
        shop: listing.shop,
        media: listing.media,
        tags: listing.tags.map((t) => t.tag),
        attributes: listing.attributes,
        variationGroups: listing.variationGroups,
        variants: listing.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          priceMinorOverride: v.priceMinorOverride,
          quantityOverride: v.quantityOverride,
          selections: Object.fromEntries(
            v.selections.map((s) => [s.option.group.name, s.option.value])
          ),
        })),
        personalizationFields: listing.personalizationFields,
        processingProfile: listing.processingProfile,
        shippingProfile: listing.shippingProfile,
        digitalAsset: listing.digitalAsset,
        isDigital: !!listing.digitalAsset,
        vintageYear: listing.vintageYear,
        vintageDecade: listing.vintageDecade,
        isHandmadeClaimed: listing.isHandmadeClaimed,
        isAiGenerated: listing.isAiGenerated,
        returnPolicyType: listing.returnPolicyType ?? listing.shop.policies?.returnPolicyType,
        returnWindowDays: listing.returnWindowDays ?? listing.shop.policies?.returnWindowDays,
        favoriteCount: listing._count.favorites,
        reviewCount: listing._count.reviews,
        averageRating: reviewStats._avg.rating,
        isFavorited,
        createdAt: listing.createdAt,
        publishedAt: listing.publishedAt,
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

export const PATCH = withRequestContext<RouteParams>(async (request, { requestId, logger, params }) => {
  const { user } = await requireSeller();
  const { slug } = params!;

  const listing = await prisma.listing.findUnique({
    where: { slug },
    select: { id: true, sellerUserId: true, slugLocked: true },
  });

  if (!listing) {
    throw new NotFoundError("Listing");
  }

  assertCanEditListing(listing.sellerUserId, user.id, user.isAdmin);

  const body = await request.json();
  const data = updateListingSchema.parse(body);

  const updatedListing = await prisma.listing.update({
    where: { id: listing.id },
    data: {
      title: data.title,
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
    },
  });

  logger.info("Listing updated", { listingId: listing.id });

  return NextResponse.json(
    {
      message: "Listing updated successfully",
      listing: {
        id: updatedListing.id,
        title: updatedListing.title,
        slug: updatedListing.slug,
        updatedAt: updatedListing.updatedAt,
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

