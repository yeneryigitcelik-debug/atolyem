import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Search & Filter API
 * Supports: query, category, minPrice, maxPrice, inStock, pagination
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const categorySlug = searchParams.get("category");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const inStockParam = searchParams.get("inStock");
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = limitParam ? parseInt(limitParam, 10) : 24;
  const skip = (page - 1) * limit;

  // Parse price filters (expects cents)
  const minPrice = minPriceParam ? parseInt(minPriceParam, 10) : null;
  const maxPrice = maxPriceParam ? parseInt(maxPriceParam, 10) : null;
  const inStock = inStockParam === "true";

  try {
    // Kategori filtresi için kategoriyi bul
    let categoryIds: string[] = [];
    let categoryName: string | null = null;
    
    if (categorySlug) {
      const category = await db.category.findUnique({
        where: { slug: categorySlug },
        include: {
          children: {
            select: { id: true },
          },
        },
      });
      if (category) {
        categoryName = category.name;
        // Eğer ana kategori ise (children varsa), alt kategorilerin ID'lerini de ekle
        if (category.children && category.children.length > 0) {
          categoryIds = [category.id, ...category.children.map((c) => c.id)];
        } else {
          // Alt kategori ise sadece kendisini ekle
          categoryIds = [category.id];
        }
      }
    }

    // Arama koşulları
    const whereConditions: any = {
      isActive: true,
    };

    // Kategori filtresi (ana kategori seçilirse alt kategoriler de dahil)
    if (categoryIds.length > 0) {
      whereConditions.categoryId = { in: categoryIds };
    }

    // Metin araması (ILIKE fallback - to_tsvector için Prisma extension gerekir)
    if (query?.trim()) {
      whereConditions.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    // Ürünlerde arama
    const products = await db.product.findMany({
      where: whereConditions,
      include: {
        images: { orderBy: { sort: "asc" }, take: 1 },
        variants: {
          orderBy: { priceCents: "asc" },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Filter by price and stock
    let filteredProducts = products;

    if (minPrice !== null || maxPrice !== null || inStock) {
      filteredProducts = products.filter((product) => {
        // Price filter: check if any variant matches price range
        if (minPrice !== null || maxPrice !== null) {
          const matchingVariants = product.variants.filter((variant) => {
            if (minPrice !== null && variant.priceCents < minPrice) {
              return false;
            }
            if (maxPrice !== null && variant.priceCents > maxPrice) {
              return false;
            }
            return true;
          });
          if (matchingVariants.length === 0) {
            return false;
          }
        }

        // Stock filter: check if any variant has stock > 0
        if (inStock) {
          const hasStock = product.variants.some((variant) => variant.stock > 0);
          if (!hasStock) {
            return false;
          }
        }

        return true;
      });
    }

    // Calculate total count for pagination (approximate, since we filter after query)
    const totalCount = await db.product.count({
      where: whereConditions,
    });

    const results = filteredProducts.map((product) => {
      const minPrice = product.variants[0]?.priceCents || 0;
      const maxPrice = product.variants[product.variants.length - 1]?.priceCents || 0;
      const hasStock = product.variants.some((v) => v.stock > 0);

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        images: product.images,
        minPrice,
        maxPrice,
        hasStock,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        } : null,
      };
    });

    return NextResponse.json({ 
      results,
      categoryName: categoryName || null,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } }, { status: 500 });
  }
}

