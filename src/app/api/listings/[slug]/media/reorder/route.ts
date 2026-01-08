/**
 * POST /api/listings/[slug]/media/reorder - Reorder listing images
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";
import { assertCanEditListing } from "@/application/integrity-rules/visibility-rules";
import { NotFoundError, AppError, ErrorCodes } from "@/lib/api/errors";
import { z } from "zod";

type RouteParams = { slug: string };

const reorderSchema = z.object({
  mediaIds: z.array(z.string().uuid()).min(1),
});

export const POST = withRequestContext<RouteParams>(
  async (request: NextRequest, { requestId, logger, params }) => {
    const { user } = await requireSeller();
    const { slug } = params!;

    // Verify listing exists and user can edit
    const listing = await prisma.listing.findUnique({
      where: { slug },
      select: { id: true, sellerUserId: true },
    });

    if (!listing) {
      throw new NotFoundError("Listing");
    }

    assertCanEditListing(listing.sellerUserId, user.id, user.isAdmin);

    const body = await request.json();
    const data = reorderSchema.parse(body);

    // Verify all media belong to this listing
    const mediaCount = await prisma.listingMedia.count({
      where: {
        id: { in: data.mediaIds },
        listingId: listing.id,
      },
    });

    if (mediaCount !== data.mediaIds.length) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Some media items do not belong to this listing",
        400
      );
    }

    // Update sortOrder for each media item
    await Promise.all(
      data.mediaIds.map((mediaId, index) =>
        prisma.listingMedia.update({
          where: { id: mediaId },
          data: { sortOrder: index },
        })
      )
    );

    logger.info("Listing images reordered", {
      listingId: listing.id,
      mediaCount: data.mediaIds.length,
    });

    return NextResponse.json(
      { message: "Images reordered successfully" },
      { headers: { "x-request-id": requestId } }
    );
  }
);



