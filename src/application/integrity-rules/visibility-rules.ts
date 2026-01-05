/**
 * Listing Visibility & Access Rules
 * 
 * Rule B: Visibility based on status and ownership
 * - Only PUBLISHED listings are public
 * - Draft/archived visible only to owner (and admins)
 * - Private custom listings: visible only to seller + intended buyer
 */

import {
  ForbiddenError,
  NotFoundError,
  AppError,
  ErrorCodes,
} from "@/lib/api/errors";
import type { ListingStatus } from "@prisma/client";

interface ListingVisibilityContext {
  listingId: string;
  status: ListingStatus;
  sellerUserId: string;
  isPrivate: boolean;
  privateAccessUserIds?: string[]; // Users with private access
}

interface ViewerContext {
  userId?: string; // undefined = anonymous
  isAdmin?: boolean;
}

/**
 * Check if a user can view a listing
 * @throws NotFoundError if listing shouldn't be visible (treated as 404 for security)
 */
export function assertCanViewListing(
  listing: ListingVisibilityContext,
  viewer: ViewerContext
): void {
  // Admins can see everything
  if (viewer.isAdmin) {
    return;
  }

  // Owner can always see their own listings
  if (viewer.userId && listing.sellerUserId === viewer.userId) {
    return;
  }

  // Private listings
  if (listing.isPrivate) {
    // Only accessible to owner and explicitly granted users
    if (
      viewer.userId &&
      listing.privateAccessUserIds?.includes(viewer.userId)
    ) {
      return;
    }
    // Treat as 404 for security (don't reveal existence)
    throw new NotFoundError("Listing");
  }

  // Public listings must be PUBLISHED
  if (listing.status !== "PUBLISHED") {
    throw new NotFoundError("Listing");
  }
}

/**
 * Check if a listing can be added to cart
 * @throws appropriate error if not purchasable
 */
export function assertListingPurchasable(
  listing: ListingVisibilityContext & { complianceStatus: string }
): void {
  // Must be published
  if (listing.status !== "PUBLISHED") {
    throw new AppError(
      ErrorCodes.LISTING_NOT_AVAILABLE,
      "This listing is not available for purchase",
      400
    );
  }

  // Must not be flagged/removed by moderation
  if (
    listing.complianceStatus === "FLAGGED" ||
    listing.complianceStatus === "REMOVED"
  ) {
    throw new AppError(
      ErrorCodes.LISTING_NOT_AVAILABLE,
      "This listing is currently unavailable",
      400
    );
  }
}

/**
 * Check if user can edit a listing
 * @throws ForbiddenError if not authorized
 */
export function assertCanEditListing(
  listingSellerUserId: string,
  userId: string,
  isAdmin = false
): void {
  if (isAdmin) return;

  if (listingSellerUserId !== userId) {
    throw new ForbiddenError("You can only edit your own listings");
  }
}

/**
 * Check if a listing can be published
 */
export function assertCanPublish(listing: {
  status: ListingStatus;
  title: string;
  basePriceMinor: number;
  baseQuantity: number;
}): void {
  if (listing.status === "PUBLISHED") {
    throw new AppError(ErrorCodes.CONFLICT, "Listing is already published", 400);
  }

  if (listing.status === "REMOVED") {
    throw new AppError(
      ErrorCodes.LISTING_NOT_AVAILABLE,
      "This listing has been removed and cannot be published",
      400
    );
  }

  // Validate required fields for publishing
  if (!listing.title || listing.title.trim().length < 3) {
    throw new AppError(
      ErrorCodes.VALIDATION_ERROR,
      "Listing title must be at least 3 characters",
      400
    );
  }

  if (listing.basePriceMinor <= 0) {
    throw new AppError(
      ErrorCodes.VALIDATION_ERROR,
      "Listing must have a valid price",
      400
    );
  }

  if (listing.baseQuantity < 1) {
    throw new AppError(
      ErrorCodes.VALIDATION_ERROR,
      "Listing must have at least 1 item in stock",
      400
    );
  }
}

