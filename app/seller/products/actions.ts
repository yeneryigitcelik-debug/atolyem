"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateSlug, generateUniqueSlug } from "@/lib/slug";

export async function createSellerProductAction(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return { error: "Giriş yapmanız gerekiyor" };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { seller: true },
  });

  if (!user?.seller) {
    return { error: "Satıcı hesabı bulunamadı" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const categoryId = formData.get("categoryId") as string | null;
  const isActive = formData.get("isActive") === "on";

  if (!title) {
    return { error: "Başlık gereklidir" };
  }

  // Slug'ı başlıktan otomatik oluştur
  let slug = generateSlug(title);

  // Benzersiz slug oluştur
  slug = await generateUniqueSlug(slug, async (s) => {
    const existing = await db.product.findUnique({ where: { slug: s } });
    return !existing;
  });

  try {
    await db.product.create({
      data: {
        title,
        slug,
        description: description || null,
        sellerId: user.seller.id,
        categoryId: categoryId || null,
        isActive,
      },
    });

    revalidatePath("/seller/products");
    redirect("/seller/products");
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Bu slug zaten kullanılıyor" };
    }
    return { error: "Ürün oluşturulurken bir hata oluştu" };
  }
}

export async function updateSellerProductAction(productId: string, prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return { error: "Giriş yapmanız gerekiyor" };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { seller: true },
  });

  if (!user?.seller) {
    return { error: "Satıcı hesabı bulunamadı" };
  }

  // Ürünün bu satıcıya ait olduğunu kontrol et
  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product || product.sellerId !== user.seller.id) {
    return { error: "Bu ürünü düzenleme yetkiniz yok" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const categoryId = formData.get("categoryId") as string | null;
  const isActive = formData.get("isActive") === "on";
  const imagesStr = formData.get("images") as string | null;

  if (!title) {
    return { error: "Başlık gereklidir" };
  }

  // Slug'ı başlıktan otomatik oluştur
  let slug = generateSlug(title);
  
  // Benzersiz slug oluştur (mevcut ürünün slug'ını hariç tut)
  slug = await generateUniqueSlug(slug, async (s) => {
    const existing = await db.product.findUnique({ where: { slug: s } });
    // Mevcut ürünün slug'ı ise kabul et
    if (existing && existing.id === productId) {
      return true;
    }
    return !existing;
  });

  // Parse images JSON
  let images: Array<{ url: string; alt?: string; sort: number; cfImageId?: string }> = [];
  if (imagesStr) {
    try {
      images = JSON.parse(imagesStr);
    } catch (e) {
      console.error("Failed to parse images JSON:", e);
      // Invalid JSON, ignore
    }
  }

  // Extract variant updates from formData
  const variantUpdates: Array<{ id: string; priceCents: number; stock: number }> = [];
  formData.forEach((value, key) => {
    if (!key.startsWith("variant-price-")) {
      return;
    }

    const variantId = key.replace("variant-price-", "");
    const priceStr = value as string;
    const stockKey = `variant-stock-${variantId}`;
    const stockStr = formData.get(stockKey) as string | null;

    if (!priceStr || !stockStr) {
      return;
    }

    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr);

    if (!isNaN(price) && price >= 0 && !isNaN(stock) && stock >= 0) {
      variantUpdates.push({
        id: variantId,
        priceCents: Math.round(price * 100),
        stock: stock,
      });
    }
  });

  try {
    // Delete existing images and create new ones
    await db.productImage.deleteMany({
      where: { productId: productId },
    });

    // Update product
    await db.product.update({
      where: { id: productId },
      data: {
        title,
        slug,
        description: description || null,
        categoryId: categoryId || null,
        isActive,
        images: {
          create: images.map((img, index) => ({
            url: img.url,
            alt: img.alt || null,
            sort: img.sort ?? index,
            cfImageId: img.cfImageId || null,
          })),
        },
      },
    });

    // Update variants
    for (const variantUpdate of variantUpdates) {
      // Verify variant belongs to this product and seller
      const variant = await db.variant.findUnique({
        where: { id: variantUpdate.id },
        include: { product: true },
      });

      if (variant && variant.productId === productId && variant.product.sellerId === user.seller.id) {
        await db.variant.update({
          where: { id: variantUpdate.id },
          data: {
            priceCents: variantUpdate.priceCents,
            stock: variantUpdate.stock,
          },
        });
      }
    }

    revalidatePath("/seller/products");
    redirect("/seller/products");
  } catch (error: any) {
    console.error("Update product error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
      productId,
    });
    
    if (error.code === "P2002") {
      return { error: "Bu slug zaten kullanılıyor" };
    }
    
    // Daha detaylı hata mesajı
    const errorMessage = error.message || "Ürün güncellenirken bir hata oluştu";
    return { 
      error: process.env.NODE_ENV === "development" 
        ? `${errorMessage} (${error.code || "unknown"})` 
        : errorMessage 
    };
  }
}

export async function deleteSellerProductAction(productId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return { error: "Giriş yapmanız gerekiyor" };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { seller: true },
  });

  if (!user?.seller) {
    return { error: "Satıcı hesabı bulunamadı" };
  }

  // Ürünün bu satıcıya ait olduğunu kontrol et
  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product || product.sellerId !== user.seller.id) {
    return { error: "Bu ürünü silme yetkiniz yok" };
  }

  try {
    // Önce ilişkili kayıtları sil
    await db.productImage.deleteMany({
      where: { productId: productId },
    });

    await db.variant.deleteMany({
      where: { productId: productId },
    });

    // Sonra ürünü sil
    await db.product.delete({
      where: { id: productId },
    });

    revalidatePath("/seller/products");
    return { success: true };
  } catch (error: any) {
    console.error("Delete product error:", error);
    return { error: "Ürün silinirken bir hata oluştu" };
  }
}

