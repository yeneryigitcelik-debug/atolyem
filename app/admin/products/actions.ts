"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProductAction(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string | null;
  const sellerId = formData.get("sellerId") as string;
  const categoryId = formData.get("categoryId") as string | null;
  const isActive = formData.get("isActive") === "on";

  if (!title || !slug || !sellerId) {
    return { error: "Başlık, slug ve satıcı gereklidir" };
  }

  try {
    await db.product.create({
      data: {
        title,
        slug,
        description: description || null,
        sellerId,
        categoryId: categoryId || null,
        isActive,
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

export async function updateProductAction(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string | null;
  const categoryId = formData.get("categoryId") as string | null;
  const isActive = formData.get("isActive") === "on";

  if (!title || !slug) {
    return { error: "Başlık ve slug gereklidir" };
  }

  try {
    await db.product.update({
      where: { id },
      data: {
        title,
        slug,
        description: description || null,
        categoryId: categoryId || null,
        isActive,
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

export async function createVariantAction(productId: string, formData: FormData) {
  const sku = formData.get("sku") as string;
  const priceCents = parseInt(formData.get("priceCents") as string);
  const stock = parseInt(formData.get("stock") as string);
  const attributesStr = formData.get("attributes") as string | null;

  if (!sku || isNaN(priceCents) || isNaN(stock)) {
    return { error: "SKU, fiyat ve stok gereklidir" };
  }

  let attributes = null;
  if (attributesStr && attributesStr.trim()) {
    try {
      attributes = JSON.parse(attributesStr);
    } catch {
      return { error: "Özellikler geçerli JSON formatında olmalıdır" };
    }
  }

  try {
    await db.variant.create({
      data: {
        productId,
        sku,
        priceCents,
        stock,
        attributes,
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

export async function updateVariantAction(variantId: string, formData: FormData) {
  const sku = formData.get("sku") as string;
  const priceCents = parseInt(formData.get("priceCents") as string);
  const stock = parseInt(formData.get("stock") as string);
  const attributesStr = formData.get("attributes") as string | null;

  if (!sku || isNaN(priceCents) || isNaN(stock)) {
    return { error: "SKU, fiyat ve stok gereklidir" };
  }

  let attributes = null;
  if (attributesStr && attributesStr.trim()) {
    try {
      attributes = JSON.parse(attributesStr);
    } catch {
      return { error: "Özellikler geçerli JSON formatında olmalıdır" };
    }
  }

  try {
    const variant = await db.variant.update({
      where: { id: variantId },
      data: {
        sku,
        priceCents,
        stock,
        attributes,
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

