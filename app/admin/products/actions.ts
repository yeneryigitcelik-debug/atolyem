"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { productSchema, variantSchema } from "@/lib/validators";

export async function createProductAction(prevState: any, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string | null;
  const sellerId = formData.get("sellerId") as string;
  const categoryId = formData.get("categoryId") as string | null;
  const isActive = formData.get("isActive") === "on";
  const imagesStr = formData.get("images") as string | null;

  // Parse images JSON
  let images: Array<{ url: string; alt?: string; sort: number }> = [];
  if (imagesStr) {
    try {
      images = JSON.parse(imagesStr);
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Validate with Zod
  const validation = productSchema.safeParse({
    title,
    slug,
    description,
    sellerId,
    categoryId: categoryId || null,
    isActive,
    images,
  });

  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { error: firstError?.message || "Geçersiz form verisi" };
  }

  const data = validation.data;

  try {
    await db.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        sellerId: data.sellerId,
        categoryId: data.categoryId,
        isActive: data.isActive,
        images: {
          create: data.images.map((img) => ({
            url: img.url,
            alt: img.alt || null,
            sort: img.sort || 0,
          })),
        },
      },
    });

    revalidatePath("/admin/products");
    redirect("/admin/products");
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Bu slug zaten kullanılıyor" };
    }
    return { error: "Ürün oluşturulurken bir hata oluştu" };
  }
}

export async function updateProductAction(id: string, prevState: any, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string | null;
  const categoryId = formData.get("categoryId") as string | null;
  const isActive = formData.get("isActive") === "on";
  const imagesStr = formData.get("images") as string | null;

  // Get existing product to preserve sellerId
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Ürün bulunamadı" };
  }

  // Parse images JSON
  let images: Array<{ url: string; alt?: string; sort: number }> = [];
  if (imagesStr) {
    try {
      images = JSON.parse(imagesStr);
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Validate with Zod
  const validation = productSchema.safeParse({
    title,
    slug,
    description,
    sellerId: existing.sellerId,
    categoryId: categoryId || null,
    isActive,
    images,
  });

  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { error: firstError?.message || "Geçersiz form verisi" };
  }

  const data = validation.data;

  try {
    // Delete existing images and create new ones
    await db.productImage.deleteMany({
      where: { productId: id },
    });

    await db.product.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        isActive: data.isActive,
        images: {
          create: data.images.map((img) => ({
            url: img.url,
            alt: img.alt || null,
            sort: img.sort || 0,
          })),
        },
      },
    });

    revalidatePath("/admin/products");
    redirect("/admin/products");
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Bu slug zaten kullanılıyor" };
    }
    return { error: "Ürün güncellenirken bir hata oluştu" };
  }
}

export async function createVariantAction(productId: string, prevState: any, formData: FormData) {
  const sku = formData.get("sku") as string;
  const priceCentsStr = formData.get("priceCents") as string;
  const stockStr = formData.get("stock") as string;
  const attributesStr = formData.get("attributes") as string | null;

  const priceCents = priceCentsStr ? parseInt(priceCentsStr) : NaN;
  const stock = stockStr ? parseInt(stockStr) : NaN;

  let attributes = null;
  if (attributesStr && attributesStr.trim()) {
    try {
      attributes = JSON.parse(attributesStr);
    } catch {
      return { error: "Özellikler geçerli JSON formatında olmalıdır" };
    }
  }

  // Validate with Zod
  const validation = variantSchema.safeParse({
    sku,
    priceCents,
    stock,
    attributes,
  });

  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { error: firstError?.message || "Geçersiz form verisi" };
  }

  const data = validation.data;

  try {
    await db.variant.create({
      data: {
        productId,
        sku: data.sku,
        priceCents: data.priceCents,
        stock: data.stock,
        attributes: (data.attributes ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });

    revalidatePath(`/admin/products/${productId}/edit`);
    redirect(`/admin/products/${productId}/edit`);
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Bu SKU zaten kullanılıyor" };
    }
    return { error: "Varyant oluşturulurken bir hata oluştu" };
  }
}

export async function updateVariantAction(variantId: string, prevState: any, formData: FormData) {
  const sku = formData.get("sku") as string;
  const priceCentsStr = formData.get("priceCents") as string;
  const stockStr = formData.get("stock") as string;
  const attributesStr = formData.get("attributes") as string | null;

  const priceCents = priceCentsStr ? parseInt(priceCentsStr) : NaN;
  const stock = stockStr ? parseInt(stockStr) : NaN;

  let attributes = null;
  if (attributesStr && attributesStr.trim()) {
    try {
      attributes = JSON.parse(attributesStr);
    } catch {
      return { error: "Özellikler geçerli JSON formatında olmalıdır" };
    }
  }

  // Validate with Zod
  const validation = variantSchema.safeParse({
    sku,
    priceCents,
    stock,
    attributes,
  });

  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { error: firstError?.message || "Geçersiz form verisi" };
  }

  const data = validation.data;

  try {
    const variant = await db.variant.update({
      where: { id: variantId },
      data: {
        sku: data.sku,
        priceCents: data.priceCents,
        stock: data.stock,
        attributes: (data.attributes ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });

    revalidatePath(`/admin/products/${variant.productId}/edit`);
    redirect(`/admin/products/${variant.productId}/edit`);
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Bu SKU zaten kullanılıyor" };
    }
    return { error: "Varyant güncellenirken bir hata oluştu" };
  }
}

