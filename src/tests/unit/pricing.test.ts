/**
 * Unit tests for pricing integrity rules
 */

import { describe, it, expect } from "vitest";
import {
  calculateLineItemTotal,
  calculateSubtotal,
  calculateOrderTotals,
  getEffectivePrice,
  getEffectiveStock,
  createOrderItemSnapshot,
} from "@/application/integrity-rules/pricing-rules";

describe("calculateLineItemTotal", () => {
  it("should calculate quantity × unit price", () => {
    const result = calculateLineItemTotal({
      listingId: "listing-1",
      quantity: 3,
      unitPriceMinor: 1000, // 10 TL
      currency: "TRY",
    });
    expect(result.amountMinor).toBe(3000); // 30 TL
    expect(result.currency).toBe("TRY");
  });

  it("should handle quantity of 1", () => {
    const result = calculateLineItemTotal({
      listingId: "listing-1",
      quantity: 1,
      unitPriceMinor: 5000,
      currency: "TRY",
    });
    expect(result.amountMinor).toBe(5000);
  });
});

describe("calculateSubtotal", () => {
  it("should sum all line items", () => {
    const items = [
      { listingId: "1", quantity: 2, unitPriceMinor: 1000, currency: "TRY" },
      { listingId: "2", quantity: 1, unitPriceMinor: 3000, currency: "TRY" },
      { listingId: "3", quantity: 3, unitPriceMinor: 500, currency: "TRY" },
    ];
    const result = calculateSubtotal(items);
    // 2×1000 + 1×3000 + 3×500 = 2000 + 3000 + 1500 = 6500
    expect(result.amountMinor).toBe(6500);
  });

  it("should return 0 for empty items", () => {
    const result = calculateSubtotal([]);
    expect(result.amountMinor).toBe(0);
  });
});

describe("calculateOrderTotals", () => {
  it("should calculate all totals correctly", () => {
    const items = [
      { listingId: "1", quantity: 2, unitPriceMinor: 1000, currency: "TRY" },
    ];
    const result = calculateOrderTotals(items, 500, 200, "TRY");

    expect(result.subtotalMinor).toBe(2000);
    expect(result.shippingTotalMinor).toBe(500);
    expect(result.discountTotalMinor).toBe(200);
    expect(result.grandTotalMinor).toBe(2300); // 2000 + 500 - 200
  });

  it("should not allow negative grand total", () => {
    const items = [
      { listingId: "1", quantity: 1, unitPriceMinor: 1000, currency: "TRY" },
    ];
    const result = calculateOrderTotals(items, 0, 5000, "TRY"); // Discount > subtotal

    expect(result.grandTotalMinor).toBe(0);
  });
});

describe("getEffectivePrice", () => {
  it("should return base price when no override", () => {
    expect(getEffectivePrice(1000, null)).toBe(1000);
    expect(getEffectivePrice(1000, undefined)).toBe(1000);
  });

  it("should return override price when set", () => {
    expect(getEffectivePrice(1000, 1500)).toBe(1500);
    expect(getEffectivePrice(1000, 500)).toBe(500);
  });

  it("should return 0 override if explicitly set to 0", () => {
    expect(getEffectivePrice(1000, 0)).toBe(0);
  });
});

describe("getEffectiveStock", () => {
  it("should return base quantity when no override", () => {
    expect(getEffectiveStock(10, null)).toBe(10);
    expect(getEffectiveStock(10, undefined)).toBe(10);
  });

  it("should return override quantity when set", () => {
    expect(getEffectiveStock(10, 5)).toBe(5);
    expect(getEffectiveStock(10, 0)).toBe(0);
  });
});

describe("createOrderItemSnapshot", () => {
  it("should create complete snapshot", () => {
    const snapshot = createOrderItemSnapshot({
      title: "Test Product",
      listingType: "MADE_BY_SELLER",
      unitPriceMinor: 1000,
      currency: "TRY",
      variantSelections: [
        { groupName: "Size", optionValue: "Large" },
        { groupName: "Color", optionValue: "Blue" },
      ],
      personalization: { name: "John" },
      processingProfile: { mode: "MADE_TO_ORDER", minDays: 3, maxDays: 7 },
      returnPolicy: { type: "RETURNS_ACCEPTED", windowDays: 14 },
    });

    expect(snapshot.title).toBe("Test Product");
    expect(snapshot.listingType).toBe("MADE_BY_SELLER");
    expect(snapshot.unitPriceMinor).toBe(1000);
    expect(snapshot.variantSnapshot).toEqual({
      Size: "Large",
      Color: "Blue",
    });
    expect(snapshot.personalizationSnapshot).toEqual({ name: "John" });
    expect(snapshot.processingTimeSnapshot).toEqual({
      mode: "MADE_TO_ORDER",
      minDays: 3,
      maxDays: 7,
    });
    expect(snapshot.policySnapshot).toEqual({
      returnPolicyType: "RETURNS_ACCEPTED",
      returnWindowDays: 14,
    });
  });

  it("should handle missing optional data", () => {
    const snapshot = createOrderItemSnapshot({
      title: "Simple Product",
      listingType: "SOURCED_BY_SELLER",
      unitPriceMinor: 500,
      currency: "TRY",
    });

    expect(snapshot.variantSnapshot).toBeNull();
    expect(snapshot.personalizationSnapshot).toBeNull();
    expect(snapshot.processingTimeSnapshot).toBeNull();
    expect(snapshot.policySnapshot).toBeNull();
  });
});

