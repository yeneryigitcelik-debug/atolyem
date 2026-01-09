/**
 * DELETE /api/listings/[slug]/media/[id] - Delete listing image
 * PATCH /api/listings/[slug]/media/[id] - Update listing image (reorder, set primary)
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller } from "@/lib/auth/require-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/db/prisma";
import { assertCanEditListing } from "@/application/integrity-rules/visibility-rules";
import { NotFoundError } from "@/lib/api/errors";
import { z } from "zod";

type RouteParams = { slug: string; id: string };

const updateMediaSchema = z.object({
  sortOrder: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
  altText: z.string().max(200).optional().nullable(),
});

export const DELETE = withRequestContext<RouteParams>(
  async (request: NextRequest, { requestId, logger, params }) => {
    const { user } = await requireSeller();
    const { slug, id } = params!;

    // Verify listing exists and user can edit
    const listing = await prisma.listing.findUnique({
      where: { slug },
      select: { id: true, sellerUserId: true },
    });

    if (!listing) {
      throw new NotFoundError("Listing");
    }

    assertCanEditListing(listing.sellerUserId, user.id, user.isAdmin);

    // Get media record
    const media = await prisma.listingMedia.findUnique({
      where: { id },
      select: { id: true, listingId: true, url: true },
    });

    if (!media || media.listingId !== listing.id) {
      throw new NotFoundError("Media");
    }

    // Delete from storage (extract path from URL)
    try {
      const url = new URL(media.url);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.findIndex((p) => p === "listing-images");
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        const filePath = pathParts.slice(bucketIndex + 1).join("/");
        const supabase = createSupabaseAdminClient();
        await supabase.storage.from("listing-images").remove([filePath]);
      }
    } catch (error) {
      logger.warn("Failed to delete image from storage", {
        mediaId: id,
        url: media.url,
        error: String(error),
      });
      // Continue with DB deletion even if storage deletion fails
    }

    // Delete from database
    await prisma.listingMedia.delete({
      where: { id },
    });

    logger.info("Listing image deleted", { listingId: listing.id, mediaId: id });

    return NextResponse.json(
      { message: "Image deleted successfully" },
      { headers: { "x-request-id": requestId } }
    );
  }
);

export const PATCH = withRequestContext<RouteParams>(
  async (request: NextRequest, { requestId, logger, params }) => {
    const { user } = await requireSeller();
    const { slug, id } = params!;

    // Verify listing exists and user can edit
    const listing = await prisma.listing.findUnique({
      where: { slug },
      select: { id: true, sellerUserId: true },
    });

    if (!listing) {
      throw new NotFoundError("Listing");
    }

    assertCanEditListing(listing.sellerUserId, user.id, user.isAdmin);

    // Get media record
    const media = await prisma.listingMedia.findUnique({
      where: { id },
      select: { id: true, listingId: true },
    });

    if (!media || media.listingId !== listing.id) {
      throw new NotFoundError("Media");
    }

    const body = await request.json();
    const data = updateMediaSchema.parse(body);

    // If setting as primary, unset other primary images
    if (data.isPrimary === true) {
      await prisma.listingMedia.updateMany({
        where: { listingId: listing.id, isPrimary: true, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    // Update media
    const updated = await prisma.listingMedia.update({
      where: { id },
      data: {
        sortOrder: data.sortOrder,
        isPrimary: data.isPrimary,
        altText: data.altText,
      },
    });

    logger.info("Listing image updated", { listingId: listing.id, mediaId: id });

    return NextResponse.json(
      {
        media: {
          id: updated.id,
          url: updated.url,
          sortOrder: updated.sortOrder,
          isPrimary: updated.isPrimary,
          altText: updated.altText,
        },
      },
      { headers: { "x-request-id": requestId } }
    );
  }
);




