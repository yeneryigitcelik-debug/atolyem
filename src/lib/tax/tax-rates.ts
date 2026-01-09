/**
 * Tax Rate Configuration
 * 
 * Defines tax rates for different countries/regions
 * Used for invoice generation and financial compliance
 */

export interface TaxRate {
  country: string;
  rate: number; // As decimal (e.g., 0.20 for 20%)
  name: string; // e.g., "KDV", "VAT", "GST"
}

/**
 * Get tax rate for a given country
 * Default: Turkey KDV (20%)
 */
export function getTaxRate(country: string = "TR"): TaxRate {
  const taxRates: Record<string, TaxRate> = {
    TR: {
      country: "TR",
      rate: 0.20, // 20% KDV
      name: "KDV",
    },
    // Add other countries as needed
    // US: { country: "US", rate: 0.0, name: "No VAT" },
    // EU: { country: "EU", rate: 0.19, name: "VAT" },
  };

  return taxRates[country] || taxRates.TR; // Default to Turkey
}

/**
 * Calculate tax amount from price
 */
export function calculateTax(priceMinor: number, taxRate: number): number {
  return Math.round(priceMinor * taxRate);
}

/**
 * Calculate price including tax
 */
export function calculatePriceWithTax(priceMinor: number, taxRate: number): number {
  return priceMinor + calculateTax(priceMinor, taxRate);
}

