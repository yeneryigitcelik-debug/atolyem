import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FavoriteSellerButton from "./FavoriteSellerButton";
import StartSellerConversationButton from "@/app/components/StartSellerConversationButton";

type Props = { params: Promise<{ id: string }> };

export default async function ArtistProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;
  const seller = await db.seller.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      products: {
        where: { isActive: true },
        include: {
          images: { orderBy: { sort: "asc" }, take: 1 },
          category: true,
          variants: {
            orderBy: { priceCents: "asc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!seller) {
    notFound();
  }

  const artistName = seller.user.name || seller.displayName || seller.user.email;
  const artistImage = seller.user.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuDDoFd-5Lopq13T-VJrLgwgSt7uH3WDYxeEUTgjk2BUXy1HdMKoQ7Aftco9cHpc54mE-kkrDTu7DAjHnYauF54_iNFcTp9woSfkGwN0Dc9TRU_xslY2zqg2Vmm4qVCMnBnCKi1vu0bRR9aUoVF4mvYVeTdxifsNl49PQTKOhWb4fJJkjqZlXeWZSdinHELFarnoPT3p_jgD0JzCHE-SNsUl2cE9DP59vnhW2zncJ2ygxHzkjImID2c0-caDfiSMSn8H7rycDNSHCn0w";

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner */}
        <div
          className="h-64 w-full rounded-xl bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCEkATcgbrdZ7_ka4gb1H3Q-j4jFyDf2LXv6dyf21znHBMnoCJn4QjlG5tB6CNphViV3ytO6cLoXTwqdhHcgN70EePty8nK-TczRS8Qg7wiN9WeaHKnNalAELi-_YxckotOK0WUytE2ZKe_pHxnqiw8vQruv2Jq757Y_p9QI3tG7fHzLy3qGF1phVew5APrYa0Tctky9EGi1IwpAqVnmze7T1M01Urgk7QBXN7r7VNiZ2a_Jyfla_C4a9Re_vSFB8MkHfZmcs_C2SpK")',
          }}
        ></div>

        {/* Profil Bilgileri */}
        <div className="relative px-4 pb-16">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 transform text-center">
            <div
              className="mx-auto size-32 rounded-full border-4 border-background-light bg-cover bg-center bg-no-repeat dark:border-background-dark"
              style={{ backgroundImage: `url("${artistImage}")` }}
            ></div>
          </div>
          <div className="pt-20 text-center">
            <h1 className="text-4xl font-bold">{artistName}</h1>
            <div className="mx-auto mt-6 max-w-2xl">
              <h2 className="text-2xl font-semibold">Sanatçının Hikayesi</h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {seller.displayName}, geleneksel Türk sanatını modern tekniklerle birleştirerek özgün eserler yaratmaktadır.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <FavoriteSellerButton sellerId={seller.id} />
              {currentUserId && currentUserId !== seller.userId && (
                <StartSellerConversationButton sellerId={seller.id} />
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="-mb-px flex space-x-8 px-4">
            <button className="border-b-2 border-[#D97706] py-4 px-1 text-sm font-medium text-[#D97706]">
              Eserleri
            </button>
            <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300">
              Yorumlar
            </button>
          </div>
        </div>

        {/* Ürünler Grid */}
        {seller.products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">Henüz ürün bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 py-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {seller.products.map((product) => {
              const minPrice = product.variants[0]?.priceCents || 0;
              return (
                <Link key={product.id} href={`/products/${product.slug}`} className="group relative">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={product.title}
                      className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                      src={product.images[0]?.url || "https://via.placeholder.com/400x400?text=Görsel+Yok"}
                    />
                  </div>
                  <div className="mt-2">
                    <h3 className="text-base font-medium">{product.title}</h3>
                    {minPrice > 0 && (
                      <p className="mt-1 text-sm font-semibold text-[#D97706]">
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
  );
}

