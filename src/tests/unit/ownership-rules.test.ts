/**
 * Unit tests for ownership and self-dealing rules
 */

import { describe, it, expect } from "vitest";
import {
  assertNotSelfPurchase,
  assertListingOwnership,
  assertShopOwnership,
  assertNotSelfFavorite,
  assertNotSelfFollow,
} from "@/application/integrity-rules/ownership-rules";
import { SelfPurchaseError, ForbiddenError } from "@/lib/api/errors";

describe("assertNotSelfPurchase", () => {
  it("should not throw when different users", () => {
    expect(() => assertNotSelfPurchase("seller-123", "buyer-456")).not.toThrow();
  });

  it("should throw SelfPurchaseError when same user", () => {
    expect(() => assertNotSelfPurchase("user-123", "user-123")).toThrow(SelfPurchaseError);
  });
});

describe("assertListingOwnership", () => {
  it("should not throw when user owns listing", () => {
    expect(() => assertListingOwnership("user-123", "user-123")).not.toThrow();
  });

  it("should throw ForbiddenError when user does not own listing", () => {
    expect(() => assertListingOwnership("owner-123", "other-456")).toThrow(ForbiddenError);
  });
});

describe("assertShopOwnership", () => {
  it("should not throw when user owns shop", () => {
    expect(() => assertShopOwnership("user-123", "user-123")).not.toThrow();
  });

  it("should throw ForbiddenError when user does not own shop", () => {
    expect(() => assertShopOwnership("owner-123", "other-456")).toThrow(ForbiddenError);
  });
});

describe("assertNotSelfFavorite", () => {
  it("should not throw when favoriting others listing", () => {
    expect(() => assertNotSelfFavorite("seller-123", "user-456")).not.toThrow();
  });

  it("should throw ForbiddenError when self-favoriting", () => {
    expect(() => assertNotSelfFavorite("user-123", "user-123")).toThrow(ForbiddenError);
  });
});

describe("assertNotSelfFollow", () => {
  it("should not throw when following others shop", () => {
    expect(() => assertNotSelfFollow("owner-123", "user-456")).not.toThrow();
  });

  it("should throw ForbiddenError when self-following", () => {
    expect(() => assertNotSelfFollow("user-123", "user-123")).toThrow(ForbiddenError);
  });
});

