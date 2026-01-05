/**
 * GET /api/purchases/:orderItemId/download - Download digital asset
 * Only for buyers who have purchased the item
 */

import { NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireBuyer } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";
import { assertCanDownload } from "@/application/integrity-rules/digital-rules";
import { NotFoundError, AppError, ErrorCodes } from "@/lib/api/errors";

type RouteParams = { orderItemId: string };

export const GET = withRequestContext<RouteParams>(async (request, { requestId, logger, params }) => {
  const { user } = await requireBuyer();
  const { orderItemId } = params!;

  // Get order item with digital delivery
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      order: true,
      digitalDelivery: {
        include: {
          digitalAsset: true,
        },
      },
    },
  });

  if (!orderItem) {
    throw new NotFoundError("Order item");
  }

  if (!orderItem.digitalDelivery) {
    throw new AppError(
      ErrorCodes.INVALID_INPUT,
      "This is not a digital item",
      400
    );
  }

  // Check download eligibility
  assertCanDownload(
    {
      orderItemId: orderItem.id,
      buyerUserId: orderItem.order.buyerUserId,
      deliveryStatus: orderItem.digitalDelivery.status,
      deliveryMode: orderItem.digitalDelivery.digitalAsset.deliveryMode,
      downloadCount: orderItem.digitalDelivery.downloadCount,
      maxDownloads: orderItem.digitalDelivery.maxDownloads,
      expiresAt: orderItem.digitalDelivery.expiresAt,
      paymentCompleted: orderItem.order.paymentStatus === "COMPLETED",
    },
    user.id
  );

  // Update download count and first download time
  const isFirstDownload = !orderItem.digitalDelivery.firstDownloadedAt;

  await prisma.digitalDelivery.update({
    where: { id: orderItem.digitalDelivery.id },
    data: {
      downloadCount: { increment: 1 },
      firstDownloadedAt: isFirstDownload ? new Date() : undefined,
    },
  });

  logger.info("Digital asset downloaded", {
    orderItemId,
    digitalAssetId: orderItem.digitalDelivery.digitalAsset.id,
    downloadCount: orderItem.digitalDelivery.downloadCount + 1,
    isFirstDownload,
  });

  // In production, this would return a signed URL or stream the file
  // For now, return the file info
  return NextResponse.json(
    {
      download: {
        fileUrl: orderItem.digitalDelivery.digitalAsset.fileUrl,
        fileName: orderItem.digitalDelivery.digitalAsset.fileName,
        fileType: orderItem.digitalDelivery.digitalAsset.fileType,
        fileSizeBytes: orderItem.digitalDelivery.digitalAsset.fileSizeBytes,
        downloadCount: orderItem.digitalDelivery.downloadCount + 1,
        maxDownloads: orderItem.digitalDelivery.maxDownloads,
        expiresAt: orderItem.digitalDelivery.expiresAt,
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

