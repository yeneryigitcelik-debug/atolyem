/**
 * Common Zod schemas for API validation.
 */

import { z } from "zod";

// ============================================================================
// Common schemas
// ============================================================================

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================================================
// Account schemas
// ============================================================================

export const accountTypeSchema = z.enum(["BUYER", "SELLER", "BOTH"]);

export const setAccountTypeSchema = z.object({
  accountType: accountTypeSchema,
});

export const activeModeSchema = z.enum(["buyer", "seller"]);

export const setActiveModeSchema = z.object({
  activeMode: activeModeSchema,
});

// ============================================================================
// Seller Profile schemas
// ============================================================================

export const createSellerProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name must be at most 100 characters"),
  bio: z.string().max(1000, "Bio must be at most 1000 characters").optional(),
});

export const updateSellerProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name must be at most 100 characters")
    .optional(),
  bio: z.string().max(1000, "Bio must be at most 1000 characters").optional(),
});

// ============================================================================
// Product schemas
// ============================================================================

export const productStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createProductSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .max(5000, "Description must be at most 5000 characters")
    .optional(),
  priceAmount: z
    .number()
    .int("Price must be an integer (in smallest currency unit)")
    .positive("Price must be positive"),
  currency: z.string().length(3).default("TRY"),
  stockQuantity: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .default(0),
  categoryId: uuidSchema,
});

export const updateProductSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  description: z
    .string()
    .max(5000, "Description must be at most 5000 characters")
    .optional()
    .nullable(),
  priceAmount: z
    .number()
    .int("Price must be an integer (in smallest currency unit)")
    .positive("Price must be positive")
    .optional(),
  currency: z.string().length(3).optional(),
  stockQuantity: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .optional(),
  categoryId: uuidSchema.optional(),
  status: productStatusSchema.optional(),
});

export const productQuerySchema = z.object({
  category: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================================================
// Order schemas
// ============================================================================

export const orderItemSchema = z.object({
  productId: uuidSchema,
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be positive"),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
});

// ============================================================================
// Type exports
// ============================================================================

export type SetAccountTypeInput = z.infer<typeof setAccountTypeSchema>;
export type SetActiveModeInput = z.infer<typeof setActiveModeSchema>;
export type CreateSellerProfileInput = z.infer<typeof createSellerProfileSchema>;
export type UpdateSellerProfileInput = z.infer<typeof updateSellerProfileSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

