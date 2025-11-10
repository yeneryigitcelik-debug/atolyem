import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProfileImageUploader from "./_components/ProfileImageUploader";

type Props = { params: Promise<{ id: string }> };

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;
  const isOwnProfile = currentUserId === id;
  const isSeller = (session?.user as any)?.role === "SELLER" || (session?.user as any)?.role === "ADMIN";
  
  const user = await db.user.findUnique({
    where: { id },
    include: {
      seller: {
        include: {
          products: {
            where: { isActive: true },
            include: {
              images: { orderBy: { sort: "asc" }, take: 1 },
              variants: {
                orderBy: { priceCents: "asc" },
                take: 1,
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const userName = user.name || user.email;
  const userImage = user.image;
  // Önce user.bannerImage, yoksa seller.bannerImage kullan
  const bannerImage = user.bannerImage || user.seller?.bannerImage;
  
  const products = user.seller?.products || [];
  const displayName = user.seller?.displayName || userName;
  const bio = user.seller
    ? `${displayName}, geleneksel Türk sanatını modern tekniklerle birleştirerek özgün eserler yaratmaktadır.`
    : `${userName}, Atölyem.net'te sanat ve el yapımı ürünlerin keşfedildiği bir topluluğun parçası.`;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <div className="flex flex-1 gap-6 mt-8">
              {/* Sidebar - Sadece kendi profilini görüyorsa ve seller ise */}
              {isOwnProfile && isSeller && (
                <aside className="hidden md:block w-64 flex-shrink-0">
                  <nav className="bg-white dark:bg-[#221810]/50 rounded-xl shadow-sm border border-black/5 dark:border-white/5 p-4 sticky top-24">
                    <div className="flex flex-col space-y-2">
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-black/70 dark:text-white/70 hover:bg-[#ec6d13]/10 dark:hover:bg-[#ec6d13]/20 hover:text-[#ec6d13] dark:hover:text-[#ec6d13] transition-colors"
                      >
                        <span className="material-symbols-outlined">list_alt</span>
                        <span className="font-medium">Siparişlerim</span>
                      </Link>
                      <Link
                        href="/messages"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-black/70 dark:text-white/70 hover:bg-[#ec6d13]/10 dark:hover:bg-[#ec6d13]/20 hover:text-[#ec6d13] dark:hover:text-[#ec6d13] transition-colors"
                      >
                        <span className="material-symbols-outlined">chat_bubble_outline</span>
                        <span className="font-medium">Mesajlarım</span>
                      </Link>
                      <Link
                        href="/seller/products"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-black/70 dark:text-white/70 hover:bg-[#ec6d13]/10 dark:hover:bg-[#ec6d13]/20 hover:text-[#ec6d13] dark:hover:text-[#ec6d13] transition-colors"
                      >
                        <span className="material-symbols-outlined">inventory_2</span>
                        <span className="font-medium">Ürünlerim</span>
                      </Link>
                      <Link
                        href={`/user/${id}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#ec6d13]/10 dark:bg-[#ec6d13]/20 text-[#ec6d13]"
                      >
                        <span className="material-symbols-outlined">person_outline</span>
                        <span className="font-medium">Profilim & Adreslerim</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-black/70 dark:text-white/70 hover:bg-[#ec6d13]/10 dark:hover:bg-[#ec6d13]/20 hover:text-[#ec6d13] dark:hover:text-[#ec6d13] transition-colors"
                      >
                        <span className="material-symbols-outlined">settings</span>
                        <span className="font-medium">Hesap Ayarları</span>
                      </Link>
                      <Link
                        href="/help"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-black/70 dark:text-white/70 hover:bg-[#ec6d13]/10 dark:hover:bg-[#ec6d13]/20 hover:text-[#ec6d13] dark:hover:text-[#ec6d13] transition-colors"
                      >
                        <span className="material-symbols-outlined">help_outline</span>
                        <span className="font-medium">Yardım & Destek</span>
                      </Link>
                    </div>
                  </nav>
                </aside>
              )}

              <main className={`flex-1 px-4 py-8 sm:px-6 lg:px-8 ${isOwnProfile && isSeller ? '' : 'mx-auto max-w-5xl'}`}>
                {/* Banner */}
                {isOwnProfile ? (
                  <ProfileImageUploader userId={id} currentImage={bannerImage} type="banner" />
                ) : (
                  <div
                    className="h-64 w-full rounded-xl bg-cover bg-center bg-no-repeat bg-gray-200"
                    style={{ backgroundImage: bannerImage ? `url("${bannerImage}")` : undefined }}
                  >
                    {!bannerImage && (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Profil Bilgileri */}
                <div className="relative px-4 pb-16">
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 transform text-center">
                    {isOwnProfile ? (
                      <ProfileImageUploader userId={id} currentImage={userImage} type="avatar" />
                    ) : (
                      <div
                        className="mx-auto size-32 rounded-full border-4 border-[#f6f7f8] bg-cover bg-center bg-no-repeat dark:border-[#111921] bg-gray-200"
                        style={{ backgroundImage: userImage ? `url("${userImage}")` : undefined }}
                      >
                        {!userImage && (
                          <div className="flex items-center justify-center h-full text-gray-400 text-2xl">
                            <span className="material-symbols-outlined">person</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="pt-20 text-center">
                    <h1 className="text-4xl font-bold">{displayName}</h1>
                    <div className="mx-auto mt-6 max-w-2xl">
                      <h2 className="text-2xl font-semibold">Sanatçının Hikayesi</h2>
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{bio}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-4">
                      {isOwnProfile && isSeller ? (
                        <Link
                          href="/eser-yukle"
                          className="inline-flex items-center justify-center rounded-lg bg-[#D97706] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#92400E]"
                        >
                          Eser Yükle
                        </Link>
                      ) : (
                        <button className="inline-flex items-center justify-center rounded-lg bg-[#1466b8] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1466b8]/80">
                          Takip Et
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-zinc-200 dark:border-zinc-800">
                  <div className="-mb-px flex space-x-8 px-4">
                    <button className="border-b-2 border-[#1466b8] py-4 px-1 text-sm font-medium text-[#1466b8]">
                      Eserleri
                    </button>
                    <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300">
                      Yorumlar
                    </button>
                  </div>
                </div>

                {/* Ürünler Grid */}
                {products.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {user.seller ? "Henüz ürün bulunmamaktadır." : "Bu kullanıcının henüz ürünü bulunmamaktadır."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 py-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => {
                      const minPrice = product.variants[0]?.priceCents || 0;
                      return (
                        <Link key={product.id} href={`/products/${product.slug}`} className="group relative">
                          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={product.title}
                              className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                              src={product.images[0]?.url || "https://via.placeholder.com/200x200?text=Görsel+Yok"}
                            />
                          </div>
                          <div className="mt-2">
                            <h3 className="text-base font-medium">{product.title}</h3>
                            {minPrice > 0 && (
                              <p className="mt-1 text-sm font-semibold text-[#1466b8]">
                                {(minPrice / 100).toLocaleString("tr-TR")} TL
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

