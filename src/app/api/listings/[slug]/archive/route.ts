/**
 * POST /api/listings/:slug/archive - Archive a listing
 */

import { NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";
import { assertCanEditListing } from "@/application/integrity-rules/visibility-rules";
import { NotFoundError, AppError, ErrorCodes } from "@/lib/api/errors";

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
    },
  });

  if (!listing) {
    throw new NotFoundError("Listing");
  }

  assertCanEditListing(listing.sellerUserId, user.id, user.isAdmin);

  if (listing.status === "ARCHIVED") {
    throw new AppError(ErrorCodes.CONFLICT, "Listing is already archived", 400);
  }

  if (listing.status === "REMOVED") {
    throw new AppError(
      ErrorCodes.LISTING_NOT_AVAILABLE,
      "This listing has been removed and cannot be archived",
      400
    );
  }

  const updatedListing = await prisma.listing.update({
    where: { id: listing.id },
    data: {
      status: "ARCHIVED",
      archivedAt: new Date(),
    },
  });

  logger.info("Listing archived", { listingId: listing.id });

  return NextResponse.json(
    {
      message: "Listing archived successfully",
      listing: {
        id: updatedListing.id,
        slug: updatedListing.slug,
        status: updatedListing.status,
        archivedAt: updatedListing.archivedAt,
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

