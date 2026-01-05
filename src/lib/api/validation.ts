/**
 * Zod Validation Schemas for all API endpoints
 */

import { z } from "zod";

// ============================================================================
// Common Schemas
// ============================================================================

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

// ============================================================================
// Seller / Shop Schemas
// ============================================================================

export const onboardSellerSchema = z.object({
  shopName: z
    .string()
    .min(2, "Shop name must be at least 2 characters")
    .max(100, "Shop name must be at most 100 characters"),
  shopSlug: slugSchema.optional(), // Auto-generated if not provided
  tagline: z.string().max(200).optional(),
  about: z.string().max(5000).optional(),
});

export const updateShopSchema = z.object({
  shopName: z.string().min(2).max(100).optional(),
  tagline: z.string().max(200).optional().nullable(),
  about: z.string().max(5000).optional().nullable(),
  bannerImageUrl: z.string().url().optional().nullable(),
  logoImageUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  instagramHandle: z.string().max(30).optional().nullable(),
});

export const shopPoliciesSchema = z.object({
  returnPolicyType: z.enum(["NO_RETURNS", "RETURNS_ACCEPTED", "EXCHANGE_ONLY"]),
  returnWindowDays: z.number().int().min(0).max(365).default(14),
  returnPolicyText: z.string().max(5000).optional().nullable(),
  exchangePolicyText: z.string().max(5000).optional().nullable(),
  customPoliciesText: z.string().max(5000).optional().nullable(),
});

export const shopSectionSchema = z.object({
  title: z.string().min(1).max(100),
  slug: slugSchema.optional(), // Auto-generated if not provided
  sortOrder: z.number().int().min(0).default(0),
});

// ============================================================================
// Processing & Shipping Profile Schemas
// ============================================================================

export const processingProfileSchema = z
  .object({
    name: z.string().min(1).max(100),
    mode: z.enum(["READY_TO_SHIP", "MADE_TO_ORDER"]),
    minDays: z.number().int().min(0).max(365),
    maxDays: z.number().int().min(0).max(365),
    isDefault: z.boolean().default(false),
  })
  .refine((data) => data.maxDays >= data.minDays, {
    message: "maxDays must be >= minDays",
  });

export const shippingRulesSchema = z.object({
  domestic: z.object({
    basePriceMinor: z.number().int().min(0),
    freeAboveMinor: z.number().int().min(0).optional(),
    additionalItemMinor: z.number().int().min(0).optional(),
  }),
  international: z.object({
    basePriceMinor: z.number().int().min(0),
    freeAboveMinor: z.number().int().min(0).optional(),
    additionalItemMinor: z.number().int().min(0).optional(),
  }).optional(),
});

export const shippingProfileSchema = z.object({
  name: z.string().min(1).max(100),
  originProvince: z.string().min(1).max(100),
  rulesJson: shippingRulesSchema,
  isDefault: z.boolean().default(false),
});

// ============================================================================
// Listing Schemas
// ============================================================================

export const listingTypeSchema = z.enum([
  "MADE_BY_SELLER",
  "DESIGNED_BY_SELLER",
  "SOURCED_BY_SELLER",
  "VINTAGE",
]);

export const createListingSchema = z
  .object({
    listingType: listingTypeSchema,
    title: z.string().min(3).max(200),
    description: z.string().max(10000).optional(),
    basePriceMinor: z.number().int().positive("Price must be positive"),
    currency: z.string().length(3).default("TRY"),
    baseQuantity: z.number().int().min(0).default(1),
    sectionId: uuidSchema.optional().nullable(),
    processingProfileId: uuidSchema.optional().nullable(),
    shippingProfileId: uuidSchema.optional().nullable(),

    // Vintage-specific
    vintageYear: z
      .number()
      .int()
      .min(1800)
      .max(new Date().getFullYear() - 20)
      .optional(),
    vintageDecade: z.string().max(20).optional(),
    vintageEvidenceNote: z.string().max(1000).optional(),

    // Flags
    isHandmadeClaimed: z.boolean().default(false),
    isAiGenerated: z.boolean().default(false),

    // Return policy override
    returnPolicyType: z
      .enum(["NO_RETURNS", "RETURNS_ACCEPTED", "EXCHANGE_ONLY"])
      .optional(),
    returnWindowDays: z.number().int().min(0).max(365).optional(),

    // Tags (validated separately for count)
    tags: z.array(z.string().min(2).max(50)).max(13).optional(),

    // Attributes
    attributes: z
      .array(
        z.object({
          key: z.string().min(1).max(50),
          value: z.string().min(1).max(200),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      // Vintage listings require vintage year
      if (data.listingType === "VINTAGE" && !data.vintageYear) {
        return false;
      }
      return true;
    },
    {
      message: "Vintage listings require vintageYear",
      path: ["vintageYear"],
    }
  );

export const updateListingSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(10000).optional().nullable(),
  basePriceMinor: z.number().int().positive().optional(),
  currency: z.string().length(3).optional(),
  baseQuantity: z.number().int().min(0).optional(),
  sectionId: uuidSchema.optional().nullable(),
  processingProfileId: uuidSchema.optional().nullable(),
  shippingProfileId: uuidSchema.optional().nullable(),
  vintageYear: z.number().int().min(1800).optional(),
  vintageDecade: z.string().max(20).optional().nullable(),
  vintageEvidenceNote: z.string().max(1000).optional().nullable(),
  isHandmadeClaimed: z.boolean().optional(),
  isAiGenerated: z.boolean().optional(),
  returnPolicyType: z.enum(["NO_RETURNS", "RETURNS_ACCEPTED", "EXCHANGE_ONLY"]).optional().nullable(),
  returnWindowDays: z.number().int().min(0).max(365).optional().nullable(),
});

// ============================================================================
// Variation Schemas
// ============================================================================

export const variationGroupSchema = z.object({
  name: z.string().min(1).max(50),
  options: z.array(z.string().min(1).max(100)).min(1).max(20),
});

export const listingVariantSchema = z.object({
  selections: z.record(z.string(), z.string()), // { groupName: optionValue }
  sku: z.string().max(100).optional(),
  priceMinorOverride: z.number().int().positive().optional().nullable(),
  quantityOverride: z.number().int().min(0).optional().nullable(),
  processingProfileIdOverride: uuidSchema.optional().nullable(),
});

// ============================================================================
// Personalization Schema
// ============================================================================

export const personalizationFieldSchema = z.object({
  label: z.string().min(1).max(100),
  isRequired: z.boolean().default(false),
  minLength: z.number().int().min(0).optional().nullable(),
  maxLength: z.number().int().min(1).max(500).optional().nullable(),
  placeholder: z.string().max(200).optional(),
  helpText: z.string().max(500).optional(),
});

// ============================================================================
// Listing Media Schema
// ============================================================================

export const listingMediaSchema = z.object({
  url: z.string().url(),
  altText: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
  mediaType: z.enum(["image", "video"]).default("image"),
});

// ============================================================================
// Digital Asset Schema
// ============================================================================

export const digitalAssetSchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string().min(1).max(255),
  fileSizeBytes: z.number().int().positive(),
  fileType: z.string().min(1).max(100),
  deliveryMode: z.enum(["INSTANT", "MANUAL"]),
});

// ============================================================================
// Cart Schemas
// ============================================================================

export const addToCartSchema = z.object({
  listingId: uuidSchema,
  variantId: uuidSchema.optional().nullable(),
  quantity: z.number().int().positive().default(1),
  personalization: z.record(z.string(), z.string()).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
  personalization: z.record(z.string(), z.string()).optional(),
});

// ============================================================================
// Checkout / Order Schemas
// ============================================================================

export const addressSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  addressLine1: z.string().min(5).max(200),
  addressLine2: z.string().max(200).optional(),
  district: z.string().min(1).max(100),
  province: z.string().min(1).max(100),
  postalCode: z.string().min(3).max(10),
  country: z.string().length(2).default("TR"),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  idempotencyKey: z.string().min(16).max(64), // Client-generated unique key
  // Note: totals are NEVER sent by client - server calculates
});

// ============================================================================
// Favorite / Follow Schemas
// ============================================================================

export const favoriteListingSchema = z.object({
  listingId: uuidSchema,
});

export const followShopSchema = z.object({
  shopId: uuidSchema,
});

// ============================================================================
// Review Schemas
// ============================================================================

export const createReviewSchema = z.object({
  orderItemId: uuidSchema,
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().min(10).max(5000).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
});

// ============================================================================
// Report Schema
// ============================================================================

export const createReportSchema = z.object({
  targetType: z.enum(["listing", "shop", "review", "user"]),
  targetId: uuidSchema,
  reason: z.enum([
    "INAPPROPRIATE_CONTENT",
    "COUNTERFEIT",
    "SPAM",
    "HARASSMENT",
    "OTHER",
  ]),
  details: z.string().max(2000).optional(),
});

// ============================================================================
// Search / Query Schemas
// ============================================================================

export const listingSearchSchema = z.object({
  q: z.string().max(200).optional(), // Search query
  category: slugSchema.optional(),
  type: listingTypeSchema.optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  tags: z.string().optional(), // Comma-separated tags
  attributes: z.string().optional(), // key:value,key2:value2 format
  shopSlug: slugSchema.optional(),
  sortBy: z.enum(["newest", "price_asc", "price_desc", "relevance"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================================================
// Type Exports
// ============================================================================

export type OnboardSellerInput = z.infer<typeof onboardSellerSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type ShopPoliciesInput = z.infer<typeof shopPoliciesSchema>;
export type ShopSectionInput = z.infer<typeof shopSectionSchema>;
export type ProcessingProfileInput = z.infer<typeof processingProfileSchema>;
export type ShippingProfileInput = z.infer<typeof shippingProfileSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ListingSearchInput = z.infer<typeof listingSearchSchema>;
