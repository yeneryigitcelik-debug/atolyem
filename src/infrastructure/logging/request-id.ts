/**
 * Request ID generation and management
 */

import { nanoid } from "nanoid";

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${nanoid(16)}`;
}

/**
 * Extract request ID from headers or generate new one
 */
export function getOrCreateRequestId(headers: Headers): string {
  const existingId = headers.get("x-request-id");
  if (existingId) {
    return existingId;
  }
  return generateRequestId();
}

