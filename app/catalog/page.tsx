import { db } from "@/lib/db";
import Link from "next/link";

export default async function CatalogPage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { sort: "asc" } },
      category: true,
      seller: { include: { user: true } },
      variants: {
        orderBy: { priceCents: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800 border-[#E5E7EB] dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Atölyem
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/catalog" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Katalog
              </Link>
              <Link href="/cart" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Sepetim
              </Link>
              <Link href="/login" className="rounded-md bg-[#D97706] px-4 py-2 text-sm font-medium text-white hover:bg-[#92400E]">
                Giriş Yap
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ürün Kataloğu</h1>
          <p className="mt-2 text-gray-600">Tüm ürünlerimizi keşfedin</p>
        </div>

        {/* Kategoriler */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Kategoriler</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalog?category=${cat.slug}`}
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Ürünler */}
        {products.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-600">Henüz ürün bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => {
              const minPrice = p.variants[0]?.priceCents || 0;
              return (
                <div
                  key={p.id}
                  className="group rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg"
                >
                  <Link href={`/products/${p.slug}`} className="block">
                    <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images[0]?.url ?? "/uploads/sample.jpg"}
                        alt={p.images[0]?.alt ?? p.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="text-xs font-medium text-[#D97706]">{p.category?.name || "Kategori yok"}</div>
                    <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">{p.title}</h3>
                    <div className="mt-2 text-lg font-bold text-gray-900">
                      {minPrice > 0 ? `${(minPrice / 100).toLocaleString("tr-TR")} TL` : "Fiyat yok"}
                    </div>
                  </Link>
                  <Link
                    href={`/artist/${p.seller.id}`}
                    className="mt-1 block text-xs text-gray-500 hover:text-[#D97706]"
                  >
                    {p.seller.user.name || p.seller.displayName || p.seller.user.email}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

