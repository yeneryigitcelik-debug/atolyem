/**
 * Digital Delivery Integrity Rules
 * 
 * Rule E: Digital product delivery
 * - Instant downloads: access after payment via Purchases area
 * - Track download events (for review window logic)
 * - Default "no returns" for instant downloads unless seller overrides
 * - Made-to-order digital: seller uploads after purchase
 */

import { AppError, ErrorCodes } from "@/lib/api/errors";
import type { DigitalDeliveryMode, DigitalDeliveryStatus, ListingType } from "@prisma/client";

/**
 * Check if a listing type is digital
 */
export function isDigitalListing(listingType: ListingType): boolean {
  // DESIGNED_BY_SELLER can be digital (downloads) or physical (prints)
  // We need additional context to determine
  return false; // Base check - actual digital status is in DigitalAsset presence
}

/**
 * Check if a listing has a digital asset attached
 */
export function hasDigitalAsset(digitalAsset: unknown): boolean {
  return digitalAsset !== null && digitalAsset !== undefined;
}

/**
 * Validate digital download eligibility
 */
export interface DigitalDownloadContext {
  orderItemId: string;
  buyerUserId: string;
  deliveryStatus: DigitalDeliveryStatus;
  deliveryMode: DigitalDeliveryMode;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: Date | null;
  paymentCompleted: boolean;
}

export function assertCanDownload(
  context: DigitalDownloadContext,
  requestingUserId: string
): void {
  // Must be the buyer
  if (context.buyerUserId !== requestingUserId) {
    throw new AppError(
      ErrorCodes.FORBIDDEN,
      "You do not have access to this download",
      403
    );
  }

  // Payment must be completed
  if (!context.paymentCompleted) {
    throw new AppError(
      ErrorCodes.ORDER_NOT_ELIGIBLE,
      "Payment must be completed before downloading",
      400
    );
  }

  // For instant downloads, status must be DELIVERED
  // For manual, seller must have uploaded (status = DELIVERED)
  if (context.deliveryStatus !== "DELIVERED") {
    if (context.deliveryMode === "MANUAL") {
      throw new AppError(
        ErrorCodes.ORDER_NOT_ELIGIBLE,
        "The seller has not yet delivered this file",
        400
      );
    }
    throw new AppError(
      ErrorCodes.ORDER_NOT_ELIGIBLE,
      "This download is not yet available",
      400
    );
  }

  // Check download limit
  if (context.downloadCount >= context.maxDownloads) {
    throw new AppError(
      ErrorCodes.DIGITAL_DOWNLOAD_LIMIT,
      `Download limit reached (${context.maxDownloads} downloads)`,
      400
    );
  }

  // Check expiration
  if (context.expiresAt && new Date() > context.expiresAt) {
    throw new AppError(
      ErrorCodes.DIGITAL_DOWNLOAD_EXPIRED,
      "This download link has expired",
      400
    );
  }
}

/**
 * Check if seller can deliver a digital file for an order item
 */
export function assertCanDeliverDigital(context: {
  orderItemSellerUserId: string;
  requestingUserId: string;
  deliveryMode: DigitalDeliveryMode;
  currentStatus: DigitalDeliveryStatus;
}): void {
  // Must be the seller
  if (context.orderItemSellerUserId !== context.requestingUserId) {
    throw new AppError(
      ErrorCodes.FORBIDDEN,
      "Only the seller can deliver digital files",
      403
    );
  }

  // Must be manual delivery mode
  if (context.deliveryMode !== "MANUAL") {
    throw new AppError(
      ErrorCodes.INVALID_INPUT,
      "This is an instant download item - no manual delivery needed",
      400
    );
  }

  // Cannot re-deliver if already delivered
  if (context.currentStatus === "DELIVERED") {
    throw new AppError(
      ErrorCodes.CONFLICT,
      "This item has already been delivered",
      400
    );
  }
}

/**
 * Get default return policy for digital items
 * Most digital items are non-refundable by default
 */
export function getDigitalDefaultReturnPolicy(): {
  type: "NO_RETURNS";
  windowDays: 0;
} {
  return {
    type: "NO_RETURNS",
    windowDays: 0,
  };
}

/**
 * Calculate review eligibility for digital items
 * Review window starts after first download
 */
export function calculateDigitalReviewWindow(
  firstDownloadedAt: Date | null,
  reviewWindowDays = 60
): { eligible: boolean; windowEndsAt: Date | null } {
  if (!firstDownloadedAt) {
    return { eligible: false, windowEndsAt: null };
  }

  const windowEnd = new Date(firstDownloadedAt);
  windowEnd.setDate(windowEnd.getDate() + reviewWindowDays);

  const now = new Date();
  return {
    eligible: now <= windowEnd,
    windowEndsAt: windowEnd,
  };
}

