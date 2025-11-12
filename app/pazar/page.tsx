import Link from "next/link";
import ProductImage from "../components/ProductImage";
import { getAllActiveProducts, getCategories } from "@/lib/data";

// Force dynamic rendering to prevent build-time database calls
export const dynamic = 'force-dynamic';
// Route-level revalidate: 300 saniye (5 dakika)
export const revalidate = 300;

export default async function PazarPage() {
  let products = [];
  let categories = [];
  
  try {
    [products, categories] = await Promise.all([
      getAllActiveProducts().catch(() => []),
      getCategories().catch(() => []),
    ]);
  } catch (error) {
    console.error("Pazar page data fetch error:", error);
    // Fallback değerler kullanılıyor
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1">
              <div className="my-8">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-2 px-4">
                  Pazar
                </h1>
                <p className="text-gray-600 mb-6 px-4">
                  Tüm el yapımı ürünleri keşfedin
                </p>

                {/* Kategoriler */}
                {categories.length > 0 && (
                  <div className="mb-8 px-4">
                    <h2 className="text-lg font-semibold text-[#1F2937] mb-4">
                      Kategoriler
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/kategori/${cat.slug}`}
                          className="rounded-full bg-white border border-border px-4 py-2 text-sm font-medium text-[#1F2937] hover:bg-primary hover:text-white transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ürünler */}
                {products.length === 0 ? (
                  <div className="rounded-lg border border-border bg-surface-light dark:bg-surface-dark p-12 text-center">
                    <p className="text-gray-600">
                      Henüz ürün bulunmamaktadır.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 p-4">
                    {products.map((product) => {
                      const minPrice = product.variants[0]?.priceCents || 0;
                      const imageUrl = product.images[0]?.url || "https://via.placeholder.com/400x400?text=Görsel+Yok";
                      const sellerName =
                        product.seller.user.name || product.seller.displayName || "Sanatçı";

                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="flex flex-col gap-3 pb-3 group"
                        >
                          <div className="w-full aspect-[3/4] rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 bg-surface-light dark:bg-surface-dark">
                            <ProductImage
                              src={imageUrl}
                              alt={product.images[0]?.alt || product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-[#1F2937] text-base font-medium leading-normal">
                              {product.title}
                            </p>
                            <p className="text-gray-600 text-sm font-normal leading-normal">
                              {sellerName} tarafından
                            </p>
                            <p className="text-[#1F2937] text-sm font-medium leading-normal">
                              {minPrice > 0
                                ? `€${(minPrice / 100).toLocaleString("tr-TR")}`
                                : "Fiyat yok"}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

