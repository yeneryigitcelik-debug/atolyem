import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { addToCart } from "@/app/cart/actions";
import Link from "next/link";
import Header from "../../components/Header";

type Props = { params: { slug: string } };

export default async function ProductPage({ params }: Props) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { sort: "asc" } },
      category: true,
      seller: { include: { user: true } },
      variants: {
        orderBy: { priceCents: "asc" },
      },
    },
  });

  if (!product || !product.isActive) return notFound();

  const minPrice = product.variants[0]?.priceCents || 0;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <Header />

            <main className="flex-1 my-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]?.url ?? "/uploads/sample.jpg"}
                    alt={product.images[0]?.alt ?? product.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm text-subtle-light dark:text-subtle-dark">
                    {product.category?.name || "Kategori yok"}
                  </div>
                  <h1 className="mt-2 text-2xl font-bold text-[#1F2937]">
                    {product.title}
                  </h1>
                  <div className="mt-2 text-lg text-[#1F2937]">
                    {minPrice > 0
                      ? `€${(minPrice / 100).toLocaleString("tr-TR")}`
                      : "Fiyat yok"}
                  </div>
                  {product.description && (
                    <p className="mt-4 whitespace-pre-line text-[#1F2937]">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-6">
                    <Link
                      href={`/artist/${product.seller.id}`}
                      className="text-sm text-subtle-light dark:text-subtle-dark hover:text-primary"
                    >
                      Sanatçı:{" "}
                      {product.seller.user.name ||
                        product.seller.displayName ||
                        product.seller.user.email}
                    </Link>
                  </div>
                  <div className="mt-6">
                    <h2 className="mb-2 font-semibold text-[#1F2937]">
                      Varyantlar
                    </h2>
                    <div className="space-y-2">
                      {product.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex items-center justify-between rounded-md border border-border bg-surface-light dark:bg-surface-dark p-3"
                        >
                          <div>
                            <div className="font-medium text-[#1F2937]">
                              {variant.sku}
                            </div>
                            <div className="text-sm text-subtle-light dark:text-subtle-dark">
                              €{(variant.priceCents / 100).toLocaleString("tr-TR")} - Stok: {variant.stock}
                            </div>
                          </div>
                          <form action={addToCart.bind(null, variant.id, 1)}>
                            <button
                              type="submit"
                              disabled={variant.stock === 0}
                              className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {variant.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

