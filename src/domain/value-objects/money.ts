/**
 * Money Value Object
 * Handles monetary values stored as integers (smallest currency unit)
 */

export interface Money {
  amountMinor: number; // Amount in smallest unit (kuruş for TRY)
  currency: string;
}

/**
 * Create a Money object from minor units
 */
export function createMoney(amountMinor: number, currency = "TRY"): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new Error("Amount must be an integer (minor units)");
  }
  if (amountMinor < 0) {
    throw new Error("Amount cannot be negative");
  }
  return { amountMinor, currency };
}

/**
 * Convert major units (e.g., 25.50 TRY) to minor units (2550 kuruş)
 */
export function toMinorUnits(amountMajor: number, currency = "TRY"): number {
  // Most currencies have 2 decimal places
  const multiplier = getMultiplier(currency);
  return Math.round(amountMajor * multiplier);
}

/**
 * Convert minor units to major units for display
 */
export function toMajorUnits(amountMinor: number, currency = "TRY"): number {
  const multiplier = getMultiplier(currency);
  return amountMinor / multiplier;
}

/**
 * Get the multiplier for a currency (usually 100 for 2 decimal places)
 */
function getMultiplier(currency: string): number {
  // Currencies with 0 decimal places
  const zeroDecimalCurrencies = ["JPY", "KRW", "VND"];
  if (zeroDecimalCurrencies.includes(currency)) {
    return 1;
  }
  // Most currencies including TRY have 2 decimal places
  return 100;
}

/**
 * Format money for display
 */
export function formatMoney(money: Money, locale = "tr-TR"): string {
  const major = toMajorUnits(money.amountMinor, money.currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
  }).format(major);
}

/**
 * Add two money values (must be same currency)
 */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error("Cannot add money with different currencies");
  }
  return createMoney(a.amountMinor + b.amountMinor, a.currency);
}

/**
 * Multiply money by quantity
 */
export function multiplyMoney(money: Money, quantity: number): Money {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Quantity must be a non-negative integer");
  }
  return createMoney(money.amountMinor * quantity, money.currency);
}

/**
 * Sum an array of money values
 */
export function sumMoney(amounts: Money[]): Money {
  if (amounts.length === 0) {
    return createMoney(0, "TRY");
  }

  const currency = amounts[0].currency;
  if (amounts.some((m) => m.currency !== currency)) {
    throw new Error("Cannot sum money with different currencies");
  }

  const total = amounts.reduce((sum, m) => sum + m.amountMinor, 0);
  return createMoney(total, currency);
}

