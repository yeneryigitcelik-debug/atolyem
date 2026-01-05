/**
 * Ownership & Self-Dealing Rules
 * 
 * Rule A: A seller must not purchase their own listing
 * - Cart add, checkout, direct-buy must all block
 * - Comparison: listing.sellerUserId != buyerUserId
 * 
 * Rule A2: Self-favoriting is blocked (ranking manipulation)
 */

import { SelfPurchaseError, ForbiddenError } from "@/lib/api/errors";

/**
 * Check if a user is trying to purchase their own listing
 * @throws SelfPurchaseError if self-purchase detected
 */
export function assertNotSelfPurchase(
  sellerUserId: string,
  buyerUserId: string
): void {
  if (sellerUserId === buyerUserId) {
    throw new SelfPurchaseError();
  }
}

/**
 * Check if user owns a listing (for edit/delete operations)
 * @throws ForbiddenError if not owner
 */
export function assertListingOwnership(
  listingSellerUserId: string,
  requestingUserId: string
): void {
  if (listingSellerUserId !== requestingUserId) {
    throw new ForbiddenError("You can only modify your own listings");
  }
}

/**
 * Check if user owns a shop (for shop operations)
 * @throws ForbiddenError if not owner
 */
export function assertShopOwnership(
  shopOwnerUserId: string,
  requestingUserId: string
): void {
  if (shopOwnerUserId !== requestingUserId) {
    throw new ForbiddenError("You can only modify your own shop");
  }
}

/**
 * Check if a user is trying to favorite their own listing
 * @throws ForbiddenError if self-favoriting
 */
export function assertNotSelfFavorite(
  listingSellerUserId: string,
  userId: string
): void {
  if (listingSellerUserId === userId) {
    throw new ForbiddenError("You cannot favorite your own listing");
  }
}

/**
 * Check if a user is trying to follow their own shop
 * @throws ForbiddenError if self-following
 */
export function assertNotSelfFollow(
  shopOwnerUserId: string,
  userId: string
): void {
  if (shopOwnerUserId === userId) {
    throw new ForbiddenError("You cannot follow your own shop");
  }
}

