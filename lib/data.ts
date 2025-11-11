import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  images: Array<{ url: string; alt: string | null }>;
  category: { id: string; name: string; slug: string } | null;
  seller: {
    id: string;
    displayName: string;
    user: { name: string | null; email: string };
  };
  variants: Array<{ priceCents: number; stock: number }>;
}

/**
 * Kategorileri sunucuda çeker ve cache'ler
 * Sıralama: ada göre artan
 * Cache süresi: 300 saniye (route-level revalidate ile birlikte)
 */
export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const categories = await db.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Hata durumunda boş array döndür
    return [];
  }
});

/**
 * Aktif ürünleri cache'lenmiş şekilde getirir
 * Edge-friendly: Sadece gerekli alanları seçer
 */
export const getActiveProducts = cache(
  async (options?: {
    limit?: number;
    skip?: number;
    categoryId?: string;
    orderBy?: "createdAt" | "price";
  }): Promise<ProductListItem[]> => {
    try {
      const { limit, skip, categoryId, orderBy = "createdAt" } = options || {};

      const where: any = { isActive: true };
      if (categoryId) {
        where.categoryId = categoryId;
      }

      // Prisma'da nested orderBy sınırlı, bu yüzden sadece createdAt kullanıyoruz
      const orderByClause = { createdAt: "desc" as const };

      const products = await db.product.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          isActive: true,
          createdAt: true,
          images: {
            orderBy: { sort: "asc" },
            take: 1,
            select: {
              url: true,
              alt: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              displayName: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          variants: {
            orderBy: { priceCents: "asc" },
            take: 1,
            select: {
              priceCents: true,
              stock: true,
            },
          },
        },
        orderBy: orderByClause,
        ...(limit && { take: limit }),
        ...(skip && { skip }),
      });

      return products as ProductListItem[];
    } catch (error) {
      console.error("Error fetching active products:", error);
      // Hata durumunda boş array döndür
      return [];
    }
  }
);

/**
 * Öne çıkan ürünleri getirir (cache'lenmiş)
 */
export const getFeaturedProducts = cache(async (limit: number = 4): Promise<ProductListItem[]> => {
  return getActiveProducts({ limit, orderBy: "createdAt" });
});

/**
 * Yeni ürünleri getirir (cache'lenmiş)
 */
export const getNewProducts = cache(
  async (limit: number = 4, skip: number = 0): Promise<ProductListItem[]> => {
    return getActiveProducts({ limit, skip, orderBy: "createdAt" });
  }
);

/**
 * Kategoriye göre ürünleri getirir (cache'lenmiş)
 */
export const getProductsByCategory = cache(
  async (categoryId: string, limit?: number): Promise<ProductListItem[]> => {
    return getActiveProducts({ categoryId, limit, orderBy: "createdAt" });
  }
);

/**
 * Tüm aktif ürünleri getirir (cache'lenmiş) - katalog için
 */
export const getAllActiveProducts = cache(async (): Promise<ProductListItem[]> => {
  return getActiveProducts({ orderBy: "createdAt" });
});

