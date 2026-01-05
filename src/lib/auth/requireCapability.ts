/**
 * Capability checks for authorization.
 * Validates that user has the required account type for an action.
 */

import type { UserContext, Capability } from "./types";
import { AUTH_ERRORS } from "./types";
import { AuthenticationError } from "./requireUser";
import { AccountType } from "@prisma/client";

/**
 * Check if user has BUYER capability (BUYER or BOTH account types)
 */
export function hasBuyerCapability(userContext: UserContext): boolean {
  return (
    userContext.appUser.accountType === AccountType.BUYER ||
    userContext.appUser.accountType === AccountType.BOTH
  );
}

/**
 * Check if user has SELLER capability (SELLER or BOTH account types)
 */
export function hasSellerCapability(userContext: UserContext): boolean {
  return (
    userContext.appUser.accountType === AccountType.SELLER ||
    userContext.appUser.accountType === AccountType.BOTH
  );
}

/**
 * Require a specific capability, throwing if not met.
 *
 * @throws AuthenticationError if capability requirement not met
 */
export function requireCapability(
  userContext: UserContext,
  capability: Capability
): void {
  if (capability === "BUYER" && !hasBuyerCapability(userContext)) {
    throw new AuthenticationError(
      AUTH_ERRORS.BUYER_REQUIRED.code,
      AUTH_ERRORS.BUYER_REQUIRED.status,
      AUTH_ERRORS.BUYER_REQUIRED.message
    );
  }

  if (capability === "SELLER" && !hasSellerCapability(userContext)) {
    throw new AuthenticationError(
      AUTH_ERRORS.SELLER_REQUIRED.code,
      AUTH_ERRORS.SELLER_REQUIRED.status,
      AUTH_ERRORS.SELLER_REQUIRED.message
    );
  }
}

/**
 * Require seller capability AND a seller profile.
 * Some seller actions require an established seller profile.
 *
 * @throws AuthenticationError if seller profile doesn't exist
 */
export function requireSellerProfile(userContext: UserContext): void {
  requireCapability(userContext, "SELLER");

  if (!userContext.sellerProfile) {
    throw new AuthenticationError(
      AUTH_ERRORS.SELLER_PROFILE_REQUIRED.code,
      AUTH_ERRORS.SELLER_PROFILE_REQUIRED.status,
      AUTH_ERRORS.SELLER_PROFILE_REQUIRED.message
    );
  }
}

/**
 * Check if user can switch to seller mode.
 * Only SELLER or BOTH account types can use seller mode.
 */
export function canUseSellerMode(userContext: UserContext): boolean {
  return hasSellerCapability(userContext);
}

/**
 * Check if user can switch to buyer mode.
 * Only BUYER or BOTH account types can use buyer mode.
 */
export function canUseBuyerMode(userContext: UserContext): boolean {
  return hasBuyerCapability(userContext);
}

