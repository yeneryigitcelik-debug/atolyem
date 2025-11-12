import Link from "next/link";
import { getAllActiveProducts, type ProductListItem } from "@/lib/data";

// Force dynamic rendering to prevent build-time database calls
export const dynamic = 'force-dynamic';
// Route-level revalidate: 300 saniye (5 dakika)
export const revalidate = 300;

export default async function CatalogPage() {
  let products: ProductListItem[] = [];
  
  try {
    products = await getAllActiveProducts().catch(() => []);
  } catch (error) {
    console.error("Catalog page data fetch error:", error);
    // Fallback değerler kullanılıyor
  }

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ürün Kataloğu</h1>
          <p className="mt-2 text-gray-600">Tüm ürünlerimizi keşfedin</p>
        </div>

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
                        src={p.images[0]?.url || "https://via.placeholder.com/400x400?text=Görsel+Yok"}
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
                    {p.seller.user.name || p.seller.displayName || p.seller.user.email || "Sanatçı"}
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

