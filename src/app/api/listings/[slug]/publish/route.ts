/**
 * POST /api/listings/:slug/publish - Publish a listing
 */

import { NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";
import { assertCanEditListing, assertCanPublish } from "@/application/integrity-rules/visibility-rules";
import { NotFoundError } from "@/lib/api/errors";

type RouteParams = { slug: string };

export const POST = withRequestContext<RouteParams>(async (request, { requestId, logger, params }) => {
  const { user } = await requireSeller();
  const { slug } = params!;

  const listing = await prisma.listing.findUnique({
    where: { slug },
    select: {
      id: true,
      sellerUserId: true,
      status: true,
      title: true,
      basePriceMinor: true,
      baseQuantity: true,
      slugLocked: true,
    },
  });

  if (!listing) {
    throw new NotFoundError("Listing");
  }

  assertCanEditListing(listing.sellerUserId, user.id, user.isAdmin);
  assertCanPublish(listing);

  const updatedListing = await prisma.listing.update({
    where: { id: listing.id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      slugLocked: true, // Lock slug after first publish
    },
  });

  logger.info("Listing published", { listingId: listing.id });

  return NextResponse.json(
    {
      message: "Listing published successfully",
      listing: {
        id: updatedListing.id,
        slug: updatedListing.slug,
        status: updatedListing.status,
        publishedAt: updatedListing.publishedAt,
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

