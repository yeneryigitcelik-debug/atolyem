"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { generateSlug, generateUniqueSlug } from "@/lib/slug";

export async function createEserAction(formData: FormData) {
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

  // Varyant bilgileri
  const sku = formData.get("sku") as string;
  const price = formData.get("price") as string;
  const stock = formData.get("stock") as string;
  const size = formData.get("size") as string | null;
  const color = formData.get("color") as string | null;
  const material = formData.get("material") as string | null;

  // Görseller
  const imageCount = parseInt(formData.get("imageCount") as string) || 0;
  const imageUrls: string[] = [];
  for (let i = 0; i < imageCount; i++) {
    const url = formData.get(`imageUrl_${i}`) as string;
    if (url) imageUrls.push(url);
  }

  // Validasyon
  if (!title) {
    return { error: "Eser adı gereklidir" };
  }
  if (!categoryId) {
    return { error: "Kategori seçilmelidir" };
  }
  if (!description) {
    return { error: "Eserin hikayesi gereklidir" };
  }
  if (imageUrls.length === 0) {
    return { error: "En az bir görsel yüklenmelidir" };
  }
  if (!sku) {
    return { error: "SKU gereklidir" };
  }
  if (!price || parseFloat(price) <= 0) {
    return { error: "Geçerli bir fiyat giriniz" };
  }
  if (!stock || parseInt(stock) < 0) {
    return { error: "Geçerli bir stok adedi giriniz" };
  }

  // Slug'ı başlıktan otomatik oluştur
  let slug = generateSlug(title);

  // Benzersiz slug oluştur
  slug = await generateUniqueSlug(slug, async (s) => {
    const existing = await db.product.findUnique({ where: { slug: s } });
    return !existing;
  });

  try {
    // Ürünü oluştur
    const product = await db.product.create({
      data: {
        title,
        slug,
        description: description || null,
        sellerId: user.seller.id,
        categoryId: categoryId || null,
        isActive,
      },
    });

    // Görselleri ekle
    for (let i = 0; i < imageUrls.length; i++) {
      await db.productImage.create({
        data: {
          productId: product.id,
          url: imageUrls[i],
          alt: `${title} - Görsel ${i + 1}`,
          sort: i,
        },
      });
    }

    // Varyant oluştur
    const attributes: any = {};
    if (size) attributes.size = size;
    if (color) attributes.color = color;
    if (material) attributes.material = material;

    await db.variant.create({
      data: {
        productId: product.id,
        sku,
        priceCents: Math.round(parseFloat(price) * 100),
        stock: parseInt(stock),
        attributes: Object.keys(attributes).length > 0 ? attributes : null,
      },
    });

    revalidatePath("/seller/products");
    revalidatePath("/eser-yukle");
    
    // Başarılı - client tarafında yönlendirme yapılacak
    return { success: true, productId: product.id };
  } catch (error: any) {
    console.error("Create eser error:", error);
    if (error.code === "P2002") {
      return { error: "Bu slug veya SKU zaten kullanılıyor" };
    }
    return { error: "Eser yüklenirken bir hata oluştu" };
  }
}

