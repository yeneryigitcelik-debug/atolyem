/**
 * API error handling utilities.
 * Provides consistent error response format across all endpoints.
 */

import { NextResponse } from "next/server";
import { ZodError, type ZodIssue } from "zod";
import { AuthenticationError } from "@/lib/auth/requireUser";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const errorBody: ApiErrorResponse = {
    error: {
      code,
      message,
    },
  };

  if (details !== undefined) {
    errorBody.error.details = details;
  }

  return NextResponse.json(errorBody, { status });
}

/**
 * Handle errors from API routes in a consistent way.
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error("API Error:", error);

  // Handle authentication errors
  if (error instanceof AuthenticationError) {
    return createErrorResponse(error.code, error.message, error.status);
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const zodError = error as ZodError<unknown>;
    return createErrorResponse(
      "VALIDATION_ERROR",
      "Invalid request data",
      400,
      zodError.issues.map((e: ZodIssue) => ({
        path: e.path.join("."),
        message: e.message,
      }))
    );
  }

  // Handle Prisma known errors
  if (
    error instanceof Error &&
    error.constructor.name === "PrismaClientKnownRequestError"
  ) {
    const prismaError = error as Error & { code: string };

    // Unique constraint violation
    if (prismaError.code === "P2002") {
      return createErrorResponse(
        "DUPLICATE_ENTRY",
        "A record with this value already exists",
        409
      );
    }

    // Foreign key constraint violation
    if (prismaError.code === "P2003") {
      return createErrorResponse(
        "INVALID_REFERENCE",
        "Referenced record does not exist",
        400
      );
    }

    // Record not found
    if (prismaError.code === "P2025") {
      return createErrorResponse("NOT_FOUND", "Record not found", 404);
    }
  }

  // Generic server error
  return createErrorResponse(
    "INTERNAL_ERROR",
    "An unexpected error occurred",
    500
  );
}
