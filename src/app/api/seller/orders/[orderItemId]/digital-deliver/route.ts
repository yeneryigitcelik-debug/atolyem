/**
 * POST /api/seller/orders/:orderItemId/digital-deliver
 * Deliver digital file for made-to-order digital items
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller } from "@/lib/auth/require-auth";
import { digitalAssetSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { assertCanDeliverDigital } from "@/application/integrity-rules/digital-rules";
import { NotFoundError, AppError, ErrorCodes } from "@/lib/api/errors";

type RouteParams = { orderItemId: string };

export const POST = withRequestContext<RouteParams>(async (request: NextRequest, { requestId, logger, params }) => {
  const { user } = await requireSeller();
  const { orderItemId } = params!;

  // Get order item
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      order: true,
      listing: {
        include: { digitalAsset: true },
      },
      digitalDelivery: true,
    },
  });

  if (!orderItem) {
    throw new NotFoundError("Order item");
  }

  // Check authorization and eligibility
  if (orderItem.sellerUserId !== user.id) {
    throw new AppError(
      ErrorCodes.FORBIDDEN,
      "You can only deliver items from your own shop",
      403
    );
  }

  if (!orderItem.listing.digitalAsset) {
    throw new AppError(
      ErrorCodes.INVALID_INPUT,
      "This is not a digital item",
      400
    );
  }

  if (!orderItem.digitalDelivery) {
    throw new AppError(
      ErrorCodes.INTERNAL_ERROR,
      "Digital delivery record not found",
      500
    );
  }

  assertCanDeliverDigital({
    orderItemSellerUserId: orderItem.sellerUserId,
    requestingUserId: user.id,
    deliveryMode: orderItem.listing.digitalAsset.deliveryMode,
    currentStatus: orderItem.digitalDelivery.status,
  });

  const body = await request.json();
  const data = digitalAssetSchema.parse(body);

  // Update or create the digital asset for this delivery
  // For manual delivery, the seller uploads a new file specific to this order
  await prisma.$transaction(async (tx) => {
    // Update the delivery record
    await tx.digitalDelivery.update({
      where: { id: orderItem.digitalDelivery!.id },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
        // Set expiration (e.g., 30 days from delivery)
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Update the digital asset with the delivered file
    await tx.digitalAsset.update({
      where: { id: orderItem.listing.digitalAsset!.id },
      data: {
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSizeBytes: data.fileSizeBytes,
        fileType: data.fileType,
      },
    });
  });

  logger.info("Digital item delivered", {
    orderItemId,
    fileName: data.fileName,
  });

  return NextResponse.json(
    {
      message: "Digital file delivered successfully",
      delivery: {
        orderItemId,
        status: "DELIVERED",
        deliveredAt: new Date().toISOString(),
        fileName: data.fileName,
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

