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
  let slug = formData.get("slug") as string;
  const description = formData.get("description") as string | null;
  const categoryId = formData.get("categoryId") as string | null;
  const isActive = formData.get("isActive") === "on";

  if (!title) {
    return { error: "Başlık gereklidir" };
  }

  // Eğer slug boşsa, başlıktan otomatik oluştur
  if (!slug || slug.trim() === "") {
    slug = generateSlug(title);
  } else {
    slug = generateSlug(slug);
  }

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
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string | null;
  const categoryId = formData.get("categoryId") as string | null;
  const isActive = formData.get("isActive") === "on";
  const imagesStr = formData.get("images") as string | null;

  if (!title || !slug) {
    return { error: "Başlık ve slug gereklidir" };
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

  // Extract variant updates from formData
  const variantUpdates: Array<{ id: string; priceCents: number; stock: number }> = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("variant-price-")) {
      const variantId = key.replace("variant-price-", "");
      const priceStr = value as string;
      const stockKey = `variant-stock-${variantId}`;
      const stockStr = formData.get(stockKey) as string;

      if (priceStr && stockStr) {
        const price = parseFloat(priceStr);
        const stock = parseInt(stockStr);

        if (!isNaN(price) && price >= 0 && !isNaN(stock) && stock >= 0) {
          variantUpdates.push({
            id: variantId,
            priceCents: Math.round(price * 100),
            stock: stock,
          });
        }
      }
    }
  }

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
          create: images.map((img) => ({
            url: img.url,
            alt: img.alt || null,
            sort: img.sort || 0,
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
    if (error.code === "P2002") {
      return { error: "Bu slug zaten kullanılıyor" };
    }
    return { error: "Ürün güncellenirken bir hata oluştu" };
  }
}

