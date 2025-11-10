import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImage from "../../components/ProductImage";
import { getProductsByCategory } from "@/lib/data";

// Route-level revalidate: 300 saniye (5 dakika)
export const revalidate = 300;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const category = await db.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  // Cache'lenmiş ürün sorgusu
  const products = await getProductsByCategory(category.id);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1">
              <div className="my-8">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-2 px-4">
                  {category.name}
                </h1>
                <p className="text-gray-600 mb-6 px-4">
                  {category.name} kategorisindeki tüm ürünler
                </p>

                {/* Ürünler */}
                {products.length === 0 ? (
                  <div className="rounded-lg border border-border bg-surface-light dark:bg-surface-dark p-12 text-center">
                    <p className="text-gray-600">
                      Bu kategoride henüz ürün bulunmamaktadır.
                    </p>
                    <Link
                      href="/pazar"
                      className="mt-4 inline-block text-primary hover:underline font-medium"
                    >
                      Tüm ürünleri görüntüle →
                    </Link>
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

