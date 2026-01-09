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
 * Shipping rules structure from ShippingProfile.rulesJson
 */
export interface ShippingRules {
  domestic: {
    basePriceMinor: number;
    freeAboveMinor?: number;
    additionalItemMinor?: number;
  };
  international?: {
    basePriceMinor: number;
    freeAboveMinor?: number;
    additionalItemMinor?: number;
  };
}

/**
 * Calculate shipping cost for a single seller's items
 * Implements Etsy-like combined shipping logic
 */
export function calculateShippingForSeller(
  items: Array<{
    quantity: number;
    unitPriceMinor: number;
  }>,
  shippingRules: ShippingRules,
  isInternational = false,
  currency = "TRY"
): Money {
  const rules = isInternational ? shippingRules.international : shippingRules.domestic;
  
  if (!rules) {
    // If no rules for this type, return 0
    return createMoney(0, currency);
  }

  // Calculate subtotal for this seller's items
  const subtotal = items.reduce((sum, item) => sum + (item.unitPriceMinor * item.quantity), 0);

  // Check if free shipping threshold is met
  if (rules.freeAboveMinor && subtotal >= rules.freeAboveMinor) {
    return createMoney(0, currency);
  }

  // Calculate total quantity
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity === 0) {
    return createMoney(0, currency);
  }

  // First item uses base price
  let shippingTotal = rules.basePriceMinor;

  // Additional items use additionalItemMinor if specified
  if (totalQuantity > 1 && rules.additionalItemMinor !== undefined) {
    shippingTotal += rules.additionalItemMinor * (totalQuantity - 1);
  }

  return createMoney(shippingTotal, currency);
}

/**
 * Calculate shipping total for entire cart
 * Groups items by seller and calculates shipping per seller
 * Then sums all seller shipping costs
 */
export function calculateShippingTotal(
  items: Array<{
    shopId: string;
    quantity: number;
    unitPriceMinor: number;
    shippingRules: ShippingRules;
    isInternational?: boolean;
  }>,
  currency = "TRY"
): Money {
  // Group items by shopId (seller)
  const itemsByShop = new Map<string, Array<{
    quantity: number;
    unitPriceMinor: number;
    shippingRules: ShippingRules;
    isInternational?: boolean;
  }>>();

  for (const item of items) {
    if (!itemsByShop.has(item.shopId)) {
      itemsByShop.set(item.shopId, []);
    }
    itemsByShop.get(item.shopId)!.push({
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
      shippingRules: item.shippingRules,
      isInternational: item.isInternational,
    });
  }

  // Calculate shipping for each seller and sum
  let totalShipping = 0;

  for (const [shopId, shopItems] of itemsByShop.entries()) {
    // All items from same shop use same shipping rules
    const firstItem = shopItems[0];
    const shippingRules = firstItem.shippingRules;
    const isInternational = firstItem.isInternational ?? false;

    const shopShipping = calculateShippingForSeller(
      shopItems.map(item => ({
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
      })),
      shippingRules,
      isInternational,
      currency
    );

    totalShipping += shopShipping.amountMinor;
  }

  return createMoney(totalShipping, currency);
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

