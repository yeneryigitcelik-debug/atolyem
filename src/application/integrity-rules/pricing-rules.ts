/**
 * Pricing Integrity Rules
 * 
 * Rule D: Server computes all totals
 * - Client never sends "final price"
 * - Order items snapshot all pricing at purchase time
 * - Shipping calculations are server-side
 */

import { createMoney, multiplyMoney, sumMoney, type Money } from "@/domain/value-objects/money";

export interface LineItemPricing {
  listingId: string;
  variantId?: string;
  quantity: number;
  unitPriceMinor: number;
  currency: string;
}

export interface OrderTotals {
  subtotalMinor: number;
  shippingTotalMinor: number;
  discountTotalMinor: number;
  grandTotalMinor: number;
  currency: string;
}

/**
 * Calculate line item total (unit price × quantity)
 */
export function calculateLineItemTotal(item: LineItemPricing): Money {
  const unitPrice = createMoney(item.unitPriceMinor, item.currency);
  return multiplyMoney(unitPrice, item.quantity);
}

/**
 * Calculate order subtotal from line items
 */
export function calculateSubtotal(items: LineItemPricing[]): Money {
  if (items.length === 0) {
    return createMoney(0, "TRY");
  }

  const lineItemTotals = items.map(calculateLineItemTotal);
  return sumMoney(lineItemTotals);
}

/**
 * Calculate shipping total
 * For now, a simplified calculation
 */
export function calculateShippingTotal(
  items: Array<{
    quantity: number;
    shippingPriceMinor: number;
    additionalItemPriceMinor?: number;
  }>,
  currency = "TRY"
): Money {
  let total = 0;

  for (const item of items) {
    // First item uses base shipping price
    total += item.shippingPriceMinor;

    // Additional items in same order
    if (item.quantity > 1 && item.additionalItemPriceMinor !== undefined) {
      total += item.additionalItemPriceMinor * (item.quantity - 1);
    }
  }

  return createMoney(total, currency);
}

/**
 * Calculate complete order totals
 */
export function calculateOrderTotals(
  lineItems: LineItemPricing[],
  shippingMinor: number,
  discountMinor = 0,
  currency = "TRY"
): OrderTotals {
  const subtotal = calculateSubtotal(lineItems);

  // Apply discount (cannot go negative)
  const grandTotal = Math.max(
    0,
    subtotal.amountMinor + shippingMinor - discountMinor
  );

  return {
    subtotalMinor: subtotal.amountMinor,
    shippingTotalMinor: shippingMinor,
    discountTotalMinor: discountMinor,
    grandTotalMinor: grandTotal,
    currency,
  };
}

/**
 * Get effective price for a listing/variant
 * Variant price overrides base price if set
 */
export function getEffectivePrice(
  basePriceMinor: number,
  variantPriceOverride: number | null | undefined
): number {
  if (variantPriceOverride !== null && variantPriceOverride !== undefined) {
    return variantPriceOverride;
  }
  return basePriceMinor;
}

/**
 * Get effective stock for a listing/variant
 * Variant stock overrides base stock if set
 */
export function getEffectiveStock(
  baseQuantity: number,
  variantQuantityOverride: number | null | undefined
): number {
  if (variantQuantityOverride !== null && variantQuantityOverride !== undefined) {
    return variantQuantityOverride;
  }
  return baseQuantity;
}

/**
 * Create order item snapshot data
 * This data is immutable after order creation
 */
export interface OrderItemSnapshot {
  title: string;
  listingType: string;
  unitPriceMinor: number;
  currency: string;
  variantSnapshot: Record<string, string> | null;
  personalizationSnapshot: Record<string, string> | null;
  processingTimeSnapshot: {
    mode: string;
    minDays: number;
    maxDays: number;
  } | null;
  policySnapshot: {
    returnPolicyType: string;
    returnWindowDays: number;
  } | null;
}

export function createOrderItemSnapshot(data: {
  title: string;
  listingType: string;
  unitPriceMinor: number;
  currency: string;
  variantSelections?: Array<{ groupName: string; optionValue: string }>;
  personalization?: Record<string, string>;
  processingProfile?: { mode: string; minDays: number; maxDays: number };
  returnPolicy?: { type: string; windowDays: number };
}): OrderItemSnapshot {
  return {
    title: data.title,
    listingType: data.listingType,
    unitPriceMinor: data.unitPriceMinor,
    currency: data.currency,
    variantSnapshot: data.variantSelections
      ? Object.fromEntries(
          data.variantSelections.map((v) => [v.groupName, v.optionValue])
        )
      : null,
    personalizationSnapshot: data.personalization || null,
    processingTimeSnapshot: data.processingProfile || null,
    policySnapshot: data.returnPolicy
      ? {
          returnPolicyType: data.returnPolicy.type,
          returnWindowDays: data.returnPolicy.windowDays,
        }
      : null,
  };
}

