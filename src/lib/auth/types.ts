/**
 * Auth-related types used across the application.
 */

import type { User, SellerProfile, Shop } from "@prisma/client";

export type Capability = "BUYER" | "SELLER";

export interface UserContext {
  supabaseUserId: string;
  user: User;
  sellerProfile: (SellerProfile & { shop: Shop | null }) | null;
}

export interface AuthError {
  code: string;
  message: string;
  status: number;
}

export const AUTH_ERRORS = {
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Authentication required",
    status: 401,
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "You do not have permission to perform this action",
    status: 403,
  },
  SELLER_REQUIRED: {
    code: "SELLER_REQUIRED",
    message: "Seller account required for this action",
    status: 403,
  },
  BUYER_REQUIRED: {
    code: "BUYER_REQUIRED",
    message: "Buyer account required for this action",
    status: 403,
  },
  SELLER_PROFILE_REQUIRED: {
    code: "SELLER_PROFILE_REQUIRED",
    message: "You must create a seller profile first",
    status: 403,
  },
} as const;
