import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  // Favori ürünleri çek
  const favoriteProducts = await db.favoriteProduct.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: { orderBy: { sort: "asc" }, take: 1 },
          variants: { orderBy: { priceCents: "asc" }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Favori satıcıları çek
  const favoriteSellers = await db.favoriteSeller.findMany({
    where: { userId },
    include: {
      seller: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          products: {
            where: { isActive: true },
            include: {
              images: { orderBy: { sort: "asc" }, take: 1 },
            },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-6xl mx-auto px-4">
                {/* Breadcrumb */}
                <div className="flex flex-wrap gap-2 mb-6 text-sm">
                  <Link href="/profile" className="text-[#1F2937]/60 hover:text-[#D97706] transition-colors">
                    Hesabım
                  </Link>
                  <span className="text-[#1F2937]/40">/</span>
                  <span className="text-[#1F2937] font-medium">Favorilerim</span>
                </div>

                <h1 className="text-3xl font-bold text-[#1F2937] mb-8">Favorilerim</h1>

                {/* Favorite Shops */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Favori Atölyeler</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {favoriteSellers.length === 0 ? (
                      <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
                        <p className="text-[#1F2937]/60 mb-4">Henüz favori atölyeniz yok</p>
                        <Link
                          href="/artists"
                          className="inline-block px-6 py-2 text-sm font-medium rounded-lg text-white bg-[#D97706] hover:bg-[#92400E] transition-colors"
                        >
                          Atölyeleri Keşfet
                        </Link>
                      </div>
                    ) : (
                      favoriteSellers.map((fav) => {
                        const seller = fav.seller;
                        const productImage = seller.products[0]?.images[0]?.url;
                        const userImage = seller.user.image;
                        return (
                          <Link key={fav.id} href={`/artist/${seller.id}`} className="flex flex-col gap-4 group">
                            <div
                              className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg overflow-hidden"
                              style={{
                                backgroundImage: productImage ? `url("${productImage}")` : userImage ? `url("${userImage}")` : "none",
                                backgroundColor: productImage || userImage ? "transparent" : "#e5e7eb",
                              }}
                            ></div>
                            <div>
                              <p className="text-base font-medium text-[#1F2937] group-hover:text-[#D97706] transition-colors">{seller.displayName}</p>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Favorite Products */}
                <section>
                  <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Favori Ürünler</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {favoriteProducts.length === 0 ? (
                      <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
                        <p className="text-[#1F2937]/60 mb-4">Henüz favori ürününüz yok</p>
                        <Link
                          href="/catalog"
                          className="inline-block px-6 py-2 text-sm font-medium rounded-lg text-white bg-[#D97706] hover:bg-[#92400E] transition-colors"
                        >
                          Alışverişe Başla
                        </Link>
                      </div>
                    ) : (
                      favoriteProducts.map((fav) => {
                        const product = fav.product;
                        const firstImage = product.images[0];
                        const firstVariant = product.variants[0];
                        const price = firstVariant ? (firstVariant.priceCents / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " TL" : "Fiyat yok";

                        return (
                          <Link key={fav.id} href={`/products/${product.slug}`} className="flex flex-col gap-4 group">
                            <div
                              className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg overflow-hidden group-hover:opacity-90 transition-opacity"
                              style={{
                                backgroundImage: firstImage?.url ? `url("${firstImage.url}")` : "none",
                                backgroundColor: firstImage?.url ? "transparent" : "#e5e7eb",
                              }}
                            ></div>
                            <div>
                              <p className="text-base font-medium text-[#1F2937] group-hover:text-[#D97706] transition-colors mb-1">{product.title}</p>
                              <p className="text-sm font-semibold text-[#D97706]">{price}</p>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

