import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const categorySlug = searchParams.get("category");

  if (!query?.trim() && !categorySlug) {
    return NextResponse.json({ results: [] });
  }

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

    // Metin araması
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
          take: 1,
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const results = products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      images: product.images,
      minPrice: product.variants[0]?.priceCents || 0,
    }));

    return NextResponse.json({ 
      results,
      categoryName: categoryName || null,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}

