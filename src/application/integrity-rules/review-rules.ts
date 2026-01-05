/**
 * Review Eligibility Rules
 * 
 * Rule: Reviews tied to completed purchases
 * - Review allowed only after estimated delivery (physical) or download (digital)
 * - Review window is limited (e.g., 60 days)
 * - One review per order item
 */

import { ReviewNotEligibleError, AppError, ErrorCodes } from "@/lib/api/errors";
import type { OrderStatus } from "@prisma/client";

export const REVIEW_WINDOW_DAYS = 60;

export interface ReviewEligibilityContext {
  orderItemId: string;
  orderStatus: OrderStatus;
  buyerUserId: string;
  isDigital: boolean;
  
  // For physical items
  estimatedDeliveryDate?: Date | null;
  actualDeliveredAt?: Date | null;
  
  // For digital items
  firstDownloadedAt?: Date | null;
  
  // Existing review
  existingReviewId?: string | null;
  
  // Order timestamps
  orderCreatedAt: Date;
  orderPaidAt?: Date | null;
}

export interface ReviewEligibilityResult {
  eligible: boolean;
  reason?: string;
  reviewWindowStart?: Date;
  reviewWindowEnd?: Date;
}

/**
 * Check if an order item is eligible for review
 */
export function checkReviewEligibility(
  context: ReviewEligibilityContext
): ReviewEligibilityResult {
  // Already has a review
  if (context.existingReviewId) {
    return {
      eligible: false,
      reason: "You have already reviewed this item",
    };
  }

  // Order must be at least PAID
  if (
    context.orderStatus === "PENDING_PAYMENT" ||
    context.orderStatus === "CANCELLED"
  ) {
    return {
      eligible: false,
      reason: "Order must be completed before leaving a review",
    };
  }

  const now = new Date();
  let windowStart: Date | null = null;

  if (context.isDigital) {
    // Digital: window starts after first download
    if (!context.firstDownloadedAt) {
      return {
        eligible: false,
        reason: "You must download the item before leaving a review",
      };
    }
    windowStart = context.firstDownloadedAt;
  } else {
    // Physical: window starts after delivery
    if (context.actualDeliveredAt) {
      windowStart = context.actualDeliveredAt;
    } else if (context.estimatedDeliveryDate) {
      // Allow review if past estimated delivery date
      if (now >= context.estimatedDeliveryDate) {
        windowStart = context.estimatedDeliveryDate;
      } else {
        return {
          eligible: false,
          reason: "Please wait until your estimated delivery date to leave a review",
        };
      }
    } else if (context.orderStatus === "DELIVERED") {
      // Fallback: if marked delivered but no date, use order paid date + 7 days
      windowStart = context.orderPaidAt
        ? new Date(context.orderPaidAt.getTime() + 7 * 24 * 60 * 60 * 1000)
        : context.orderCreatedAt;
    } else {
      return {
        eligible: false,
        reason: "Item must be delivered before leaving a review",
      };
    }
  }

  // Calculate window end
  const windowEnd = new Date(windowStart);
  windowEnd.setDate(windowEnd.getDate() + REVIEW_WINDOW_DAYS);

  // Check if within window
  if (now > windowEnd) {
    return {
      eligible: false,
      reason: "The review window for this item has closed",
      reviewWindowStart: windowStart,
      reviewWindowEnd: windowEnd,
    };
  }

  return {
    eligible: true,
    reviewWindowStart: windowStart,
    reviewWindowEnd: windowEnd,
  };
}

/**
 * Assert that a review can be created
 * @throws ReviewNotEligibleError if not eligible
 */
export function assertCanReview(
  context: ReviewEligibilityContext,
  requestingUserId: string
): void {
  // Must be the buyer
  if (context.buyerUserId !== requestingUserId) {
    throw new AppError(
      ErrorCodes.FORBIDDEN,
      "Only the buyer can leave a review",
      403
    );
  }

  const eligibility = checkReviewEligibility(context);

  if (!eligibility.eligible) {
    throw new ReviewNotEligibleError(eligibility.reason!);
  }
}

/**
 * Validate review content
 */
export function validateReviewContent(
  rating: number,
  text?: string | null
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Rating must be 1-5
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push("Rating must be between 1 and 5");
  }

  // Text is optional but if provided, check length
  if (text) {
    if (text.length < 10) {
      errors.push("Review text must be at least 10 characters");
    }
    if (text.length > 5000) {
      errors.push("Review text must be at most 5000 characters");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

