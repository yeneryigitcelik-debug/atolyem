/**
 * Request Context Middleware
 * Adds requestId and logging to all API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateRequestId } from "@/infrastructure/logging/request-id";
import { createRequestLogger } from "@/infrastructure/logging/logger";
import { handleApiError } from "@/lib/api/errors";

export type RequestContext = {
  requestId: string;
  logger: ReturnType<typeof createRequestLogger>;
};

export type RouteHandler<T = unknown> = (
  request: NextRequest,
  context: RequestContext & { params?: T }
) => Promise<NextResponse>;

/**
 * Wrap a route handler with request context (requestId, logging)
 */
export function withRequestContext<T = unknown>(
  handler: RouteHandler<T>
): (request: NextRequest, context?: { params?: Promise<T> }) => Promise<NextResponse> {
  return async (request: NextRequest, routeContext?: { params?: Promise<T> }) => {
    const requestId = getOrCreateRequestId(request.headers);
    const logger = createRequestLogger(requestId);
    
    // Resolve params if they exist
    const params = routeContext?.params ? await routeContext.params : undefined;

    try {
      logger.info(`${request.method} ${request.nextUrl.pathname}`, {
        method: request.method,
        path: request.nextUrl.pathname,
        query: Object.fromEntries(request.nextUrl.searchParams),
      });

      const response = await handler(request, {
        requestId,
        logger,
        params,
      });

      // Add requestId to response headers
      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      return handleApiError(error, requestId);
    }
  };
}

