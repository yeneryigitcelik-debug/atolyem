/**
 * POST /api/listings/[slug]/media - Upload listing image
 * DELETE /api/listings/[slug]/media/[id] - Delete listing image
 * PATCH /api/listings/[slug]/media/[id] - Update listing image (reorder, set primary)
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller } from "@/lib/auth/require-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/db/prisma";
import { assertCanEditListing } from "@/application/integrity-rules/visibility-rules";
import { NotFoundError, AppError, ErrorCodes } from "@/lib/api/errors";
import { z } from "zod";

type RouteParams = { slug: string };

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const updateMediaSchema = z.object({
  sortOrder: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
  altText: z.string().max(200).optional().nullable(),
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const sortOrder = formData.get("sortOrder")
      ? parseInt(formData.get("sortOrder") as string, 10)
      : undefined;
    const isPrimary = formData.get("isPrimary") === "true";

    if (!file) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, "No file provided", 400);
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Invalid file type. Only JPEG, PNG, and WebP are allowed",
        400
      );
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        `File too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
        400
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const filename = `listings/${listing.id}/${timestamp}-${random}.${ext}`;
    const bucket = "listing-images";

    // Upload to Supabase Storage
    const supabase = createSupabaseAdminClient();
    const buffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      logger.error(
        "Failed to upload image to Supabase Storage",
        new Error(uploadError.message),
        { filename, listingId: listing.id }
      );
      throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to upload image", 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);

    // Get current max sortOrder if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined) {
      const maxOrder = await prisma.listingMedia.aggregate({
        where: { listingId: listing.id },
        _max: { sortOrder: true },
      });
      finalSortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    }

    // If this is set as primary, unset other primary images
    if (isPrimary) {
      await prisma.listingMedia.updateMany({
        where: { listingId: listing.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Create media record
    const media = await prisma.listingMedia.create({
      data: {
        listingId: listing.id,
        url: urlData.publicUrl,
        sortOrder: finalSortOrder,
        isPrimary,
        mediaType: "image",
      },
    });

    logger.info("Listing image uploaded", {
      listingId: listing.id,
      mediaId: media.id,
      path: uploadData.path,
    });

    return NextResponse.json(
      {
        media: {
          id: media.id,
          url: media.url,
          sortOrder: media.sortOrder,
          isPrimary: media.isPrimary,
          altText: media.altText,
          createdAt: media.createdAt,
        },
      },
      { status: 201, headers: { "x-request-id": requestId } }
    );
  }
);


