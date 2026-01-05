/**
 * API Error Handling - Standardized error responses
 * All errors include requestId for tracing
 */

import { NextResponse } from "next/server";
import { ZodError, type ZodIssue } from "zod";
import { logger } from "@/infrastructure/logging/logger";

// ============================================================================
// Error Codes
// ============================================================================

export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Business Rules / Integrity
  SELF_PURCHASE_NOT_ALLOWED: "SELF_PURCHASE_NOT_ALLOWED",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  LISTING_NOT_AVAILABLE: "LISTING_NOT_AVAILABLE",
  LISTING_NOT_PUBLISHED: "LISTING_NOT_PUBLISHED",
  INVALID_LISTING_TYPE: "INVALID_LISTING_TYPE",
  PERSONALIZATION_REQUIRED: "PERSONALIZATION_REQUIRED",
  PERSONALIZATION_INVALID: "PERSONALIZATION_INVALID",
  CART_EMPTY: "CART_EMPTY",
  CHECKOUT_FAILED: "CHECKOUT_FAILED",
  ORDER_NOT_ELIGIBLE: "ORDER_NOT_ELIGIBLE",
  REVIEW_NOT_ELIGIBLE: "REVIEW_NOT_ELIGIBLE",
  REVIEW_WINDOW_CLOSED: "REVIEW_WINDOW_CLOSED",
  DIGITAL_DOWNLOAD_EXPIRED: "DIGITAL_DOWNLOAD_EXPIRED",
  DIGITAL_DOWNLOAD_LIMIT: "DIGITAL_DOWNLOAD_LIMIT",
  TAG_LIMIT_EXCEEDED: "TAG_LIMIT_EXCEEDED",
  SLUG_CONFLICT: "SLUG_CONFLICT",
  SELLER_PROFILE_REQUIRED: "SELLER_PROFILE_REQUIRED",
  SHOP_REQUIRED: "SHOP_REQUIRED",
  PRIVATE_LISTING_ACCESS_DENIED: "PRIVATE_LISTING_ACCESS_DENIED",

  // Server Errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ============================================================================
// Error Response Types
// ============================================================================

export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    requestId: string;
  };
}

// ============================================================================
// Application Error Classes
// ============================================================================

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(ErrorCodes.UNAUTHORIZED, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(ErrorCodes.FORBIDDEN, message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(ErrorCodes.NOT_FOUND, `${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(ErrorCodes.CONFLICT, message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCodes.VALIDATION_ERROR, message, 400, details);
  }
}

// Integrity Rule Errors
export class SelfPurchaseError extends AppError {
  constructor() {
    super(
      ErrorCodes.SELF_PURCHASE_NOT_ALLOWED,
      "You cannot purchase your own listing",
      400
    );
  }
}

export class InsufficientStockError extends AppError {
  constructor(listingId: string, available: number, requested: number) {
    super(
      ErrorCodes.INSUFFICIENT_STOCK,
      `Insufficient stock for listing. Available: ${available}, Requested: ${requested}`,
      400,
      { listingId, available, requested }
    );
  }
}

export class ListingNotAvailableError extends AppError {
  constructor(listingId: string, reason?: string) {
    super(
      ErrorCodes.LISTING_NOT_AVAILABLE,
      reason || "This listing is no longer available",
      400,
      { listingId }
    );
  }
}

export class ReviewNotEligibleError extends AppError {
  constructor(reason: string) {
    super(ErrorCodes.REVIEW_NOT_ELIGIBLE, reason, 400);
  }
}

export class TagLimitError extends AppError {
  constructor(limit: number) {
    super(
      ErrorCodes.TAG_LIMIT_EXCEEDED,
      `Maximum ${limit} tags allowed per listing`,
      400,
      { limit }
    );
  }
}

// ============================================================================
// Error Response Helpers
// ============================================================================

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  statusCode: number,
  requestId: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const errorBody: ApiErrorResponse = {
    error: {
      code,
      message,
      requestId,
    },
  };

  if (details !== undefined) {
    errorBody.error.details = details;
  }

  return NextResponse.json(errorBody, { status: statusCode });
}

/**
 * Handle any error and return appropriate API response
 */
export function handleApiError(
  error: unknown,
  requestId: string
): NextResponse<ApiErrorResponse> {
  // Log the error
  if (error instanceof Error) {
    logger.error(error.message, error, { requestId });
  } else {
    logger.error("Unknown error", undefined, { requestId, error });
  }

  // Handle known application errors
  if (error instanceof AppError) {
    return createErrorResponse(
      error.code,
      error.message,
      error.statusCode,
      requestId,
      error.details
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      "Invalid request data",
      400,
      requestId,
      error.issues.map((e: ZodIssue) => ({
        path: e.path.join("."),
        message: e.message,
      }))
    );
  }

  // Handle Prisma errors
  if (
    error instanceof Error &&
    error.constructor.name === "PrismaClientKnownRequestError"
  ) {
    const prismaError = error as Error & { code: string };

    if (prismaError.code === "P2002") {
      return createErrorResponse(
        ErrorCodes.ALREADY_EXISTS,
        "A record with this value already exists",
        409,
        requestId
      );
    }

    if (prismaError.code === "P2003") {
      return createErrorResponse(
        ErrorCodes.INVALID_INPUT,
        "Referenced record does not exist",
        400,
        requestId
      );
    }

    if (prismaError.code === "P2025") {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        "Record not found",
        404,
        requestId
      );
    }
  }

  // Generic server error
  return createErrorResponse(
    ErrorCodes.INTERNAL_ERROR,
    "An unexpected error occurred",
    500,
    requestId
  );
}
