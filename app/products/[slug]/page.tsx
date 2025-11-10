import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductImage from "@/app/components/ProductImage";
import StartConversationButton from "./StartConversationButton";
import FavoriteButton from "./FavoriteButton";
import VariantSelector from "./VariantSelector";
import ReviewsSection from "./ReviewsSection";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;
  
  const product = await db.product.findUnique({
    where: { slug },
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
  const isOwnProduct = currentUserId === product.seller.userId;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  {/* Ana görsel */}
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-gray-100">
                    {product.images && product.images.length > 0 && product.images[0]?.url ? (
                      <ProductImage
                        src={product.images[0].url}
                        alt={product.images[0]?.alt ?? product.title}
                        fill
                        className="relative h-full w-full"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <span>Görsel yok</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Diğer görseller (thumbnail grid) */}
                  {product.images && product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.slice(1, 5).map((image, index) => (
                        <div
                          key={image.id || index}
                          className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                        >
                          <ProductImage
                            src={image.url}
                            alt={image.alt ?? `${product.title} - Görsel ${index + 2}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 25vw, 12.5vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
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
                      ? `${(minPrice / 100).toLocaleString("tr-TR")} TL`
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
                  {/* Varyant Seçimi ve Sepete Ekleme */}
                  <div className="mt-6">
                    {product.variants.length === 0 ? (
                      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                        <p className="text-sm text-yellow-800">
                          Bu ürün için henüz varyant tanımlanmamış.
                        </p>
                      </div>
                    ) : (
                      <VariantSelector
                        variants={product.variants.map((v) => ({
                          id: v.id,
                          sku: v.sku,
                          priceCents: v.priceCents,
                          stock: v.stock,
                          attributes: v.attributes,
                        }))}
                        productTitle={product.title}
                        disabled={isOwnProduct}
                      />
                    )}
                  </div>

                  {/* Satıcı CTA'ları */}
                  {currentUserId && !isOwnProduct && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      <FavoriteButton productId={product.id} />
                      <StartConversationButton productId={product.id} sellerId={product.seller.id} />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Yorumlar Bölümü */}
              <div className="mt-12">
                <ReviewsSection productId={product.id} productTitle={product.title} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

