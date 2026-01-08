/**
 * Subscription plan constants
 * All pricing and limits are defined here for easy management
 */

export enum SubscriptionPlan {
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
  PAST_DUE = "PAST_DUE",
}

/**
 * Monthly subscription prices in Turkish Lira (minor units - kuruş)
 */
export const SUBSCRIPTION_PRICES = {
  [SubscriptionPlan.BASIC]: 20000, // 200.00 TL = 20000 kuruş
  [SubscriptionPlan.PREMIUM]: 25000, // 250.00 TL = 25000 kuruş
} as const;

/**
 * Listing limits per month
 */
export const SUBSCRIPTION_LIMITS = {
  [SubscriptionPlan.BASIC]: 3, // 3 listings per month
  [SubscriptionPlan.PREMIUM]: Infinity, // Unlimited
} as const;

/**
 * Plan features for UI display
 */
export const PLAN_FEATURES = {
  [SubscriptionPlan.BASIC]: {
    name: "Basic",
    price: 200,
    priceFormatted: "200 TL/ay",
    features: [
      "3 ürün/ay yükleme limiti",
      "Standart listeleme",
      "Temel istatistikler",
      "Müşteri desteği",
    ],
    listingLimit: 3,
  },
  [SubscriptionPlan.PREMIUM]: {
    name: "Premium",
    price: 250,
    priceFormatted: "250 TL/ay",
    features: [
      "Sınırsız ürün yükleme",
      "Öne çıkarma/rozet",
      "Gelişmiş istatistikler",
      "Öncelikli destek",
    ],
    listingLimit: Infinity,
  },
} as const;

