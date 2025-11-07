import { z } from "zod";

/**
 * Validation schemas using Zod
 * Used for form validation in admin and user-facing forms
 */

/**
 * Category validation schema
 */
export const categorySchema = z.object({
  name: z.string().min(1, "Kategori adı gereklidir").max(100, "Kategori adı çok uzun"),
  slug: z.string().min(1, "Slug gereklidir").max(100, "Slug çok uzun").regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  parentId: z.string().optional().nullable(),
});

/**
 * Product validation schema
 */
export const productSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir").max(200, "Başlık çok uzun"),
  slug: z.string().min(1, "Slug gereklidir").max(200, "Slug çok uzun").regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  description: z.string().max(5000, "Açıklama çok uzun").optional().nullable(),
  sellerId: z.string().min(1, "Satıcı gereklidir"),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  images: z.array(
    z.object({
      url: z.string().url("Geçerli bir URL olmalıdır"),
      alt: z.string().optional().nullable(),
      sort: z.number().int().min(0).default(0),
    })
  ).optional().default([]),
});

/**
 * Variant validation schema
 */
export const variantSchema = z.object({
  sku: z.string().min(1, "SKU gereklidir").max(100, "SKU çok uzun"),
  priceCents: z.number().int().min(1, "Fiyat 0'dan büyük olmalıdır"),
  stock: z.number().int().min(0, "Stok negatif olamaz"),
  attributes: z.record(z.string(), z.any()).optional().nullable(),
});

/**
 * Address validation schema
 */
export const addressSchema = z.object({
  title: z.string().min(1, "Adres başlığı gereklidir").max(50, "Başlık çok uzun"),
  city: z.string().min(1, "Şehir gereklidir").max(100, "Şehir adı çok uzun"),
  district: z.string().min(1, "İlçe gereklidir").max(100, "İlçe adı çok uzun"),
  addressLine: z.string().min(1, "Adres satırı gereklidir").max(500, "Adres çok uzun"),
  phone: z.string().max(20, "Telefon çok uzun").optional().nullable(),
  isDefault: z.boolean().default(false),
});

/**
 * Cart item validation schema
 */
export const cartItemSchema = z.object({
  variantId: z.string().min(1, "Varyant ID gereklidir"),
  qty: z.number().int().min(1, "Miktar en az 1 olmalıdır"),
});

/**
 * Order placement validation schema
 */
export const placeOrderSchema = z.object({
  addressId: z.string().min(1, "Adres gereklidir"),
});

/**
 * Shipment tracking validation schema
 */
export const shipmentSchema = z.object({
  carrier: z.string().min(1, "Kargo firması gereklidir").max(100, "Kargo firması adı çok uzun"),
  trackingCode: z.string().min(1, "Takip numarası gereklidir").max(100, "Takip numarası çok uzun"),
});

/**
 * Payment webhook validation schema (generic)
 */
export const paymentWebhookSchema = z.object({
  orderId: z.string().min(1, "Sipariş ID gereklidir"),
  txnId: z.string().min(1, "Transaction ID gereklidir"),
  amountCents: z.number().int().min(1, "Tutar 0'dan büyük olmalıdır"),
  gateway: z.enum(["IYZICO", "PAYTR"]).refine(
    (val) => val === "IYZICO" || val === "PAYTR",
    { message: "Geçerli bir ödeme gateway'i seçilmelidir" }
  ),
  rawPayload: z.any().optional(),
});

