/**
 * Stock & Concurrency Rules
 * 
 * Rule C: Stock management with concurrency safety
 * - Stock decremented in DB transaction with correct isolation
 * - If item unavailable/archived/stock=0 between cart and checkout, fail clearly
 * - Idempotency for checkout endpoint
 */

import { InsufficientStockError, ListingNotAvailableError } from "@/lib/api/errors";
import type { ListingStatus } from "@prisma/client";

interface StockContext {
  listingId: string;
  variantId?: string;
  currentStock: number;
  requestedQuantity: number;
  listingStatus: ListingStatus;
}

/**
 * Check if there's sufficient stock for a purchase
 * @throws InsufficientStockError if not enough stock
 * @throws ListingNotAvailableError if listing not purchasable
 */
export function assertSufficientStock(context: StockContext): void {
  // First check listing is still published
  if (context.listingStatus !== "PUBLISHED") {
    throw new ListingNotAvailableError(
      context.listingId,
      "This listing is no longer available"
    );
  }

  // Check stock
  if (context.currentStock < context.requestedQuantity) {
    throw new InsufficientStockError(
      context.listingId,
      context.currentStock,
      context.requestedQuantity
    );
  }
}

/**
 * Calculate new stock after decrement
 * Returns null if insufficient stock
 */
export function calculateStockDecrement(
  currentStock: number,
  decrementBy: number
): number | null {
  if (currentStock < decrementBy) {
    return null;
  }
  return currentStock - decrementBy;
}

/**
 * Validate cart items before checkout
 * Returns validation results for each item
 */
export interface CartItemValidation {
  cartItemId: string;
  listingId: string;
  variantId?: string;
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
  availableStock?: number;
  requestedQuantity?: number;
}

export function validateCartItemsForCheckout(
  items: Array<{
    cartItemId: string;
    listingId: string;
    variantId?: string;
    quantity: number;
    listing: {
      status: ListingStatus;
      complianceStatus: string;
      sellerUserId: string;
    };
    currentStock: number;
  }>,
  buyerUserId: string
): CartItemValidation[] {
  return items.map((item) => {
    // Check self-purchase
    if (item.listing.sellerUserId === buyerUserId) {
      return {
        cartItemId: item.cartItemId,
        listingId: item.listingId,
        variantId: item.variantId,
        isValid: false,
        errorCode: "SELF_PURCHASE_NOT_ALLOWED",
        errorMessage: "You cannot purchase your own listing",
      };
    }

    // Check listing status
    if (item.listing.status !== "PUBLISHED") {
      return {
        cartItemId: item.cartItemId,
        listingId: item.listingId,
        variantId: item.variantId,
        isValid: false,
        errorCode: "LISTING_NOT_AVAILABLE",
        errorMessage: "This listing is no longer available",
      };
    }

    // Check compliance
    if (
      item.listing.complianceStatus === "FLAGGED" ||
      item.listing.complianceStatus === "REMOVED"
    ) {
      return {
        cartItemId: item.cartItemId,
        listingId: item.listingId,
        variantId: item.variantId,
        isValid: false,
        errorCode: "LISTING_NOT_AVAILABLE",
        errorMessage: "This listing is currently unavailable",
      };
    }

    // Check stock
    if (item.currentStock < item.quantity) {
      return {
        cartItemId: item.cartItemId,
        listingId: item.listingId,
        variantId: item.variantId,
        isValid: false,
        errorCode: "INSUFFICIENT_STOCK",
        errorMessage: `Only ${item.currentStock} available`,
        availableStock: item.currentStock,
        requestedQuantity: item.quantity,
      };
    }

    return {
      cartItemId: item.cartItemId,
      listingId: item.listingId,
      variantId: item.variantId,
      isValid: true,
    };
  });
}

