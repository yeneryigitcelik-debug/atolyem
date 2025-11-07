import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default async function ArtistProfilePage({ params }: Props) {
  const { id } = await params;
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
    <div className="flex min-h-screen w-full flex-col bg-[#FFF8F1] dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b border-[#E5E7EB] bg-[#FFF8F1]/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <svg className="h-6 w-6 text-[#D97706]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
              <h2 className="text-xl font-bold">Atölyem.net</h2>
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              <Link href="/" className="text-sm font-medium hover:text-[#D97706] dark:text-zinc-300 dark:hover:text-[#D97706]">
                Ana Sayfa
              </Link>
              <Link href="/catalog" className="text-sm font-medium hover:text-[#D97706] dark:text-zinc-300 dark:hover:text-[#D97706]">
                Kategoriler
              </Link>
              <Link href="/catalog" className="text-sm font-medium hover:text-[#D97706] dark:text-zinc-300 dark:hover:text-[#D97706]">
                Sanatçılar
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/catalog" className="hidden rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-[#D97706] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-[#D97706] sm:block">
              <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </Link>
            <Link href="/login" className="size-10 rounded-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("${artistImage}")` }}></Link>
          </div>
        </div>
      </header>

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
            <button className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#D97706] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#92400E]">
              Takip Et
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="-mb-px flex space-x-8 px-4">
            <a className="border-b-2 border-[#D97706] py-4 px-1 text-sm font-medium text-[#D97706]" href="#">
              Eserleri
            </a>
            <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300" href="#">
              Yorumlar
            </a>
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
                      src={product.images[0]?.url ?? "/uploads/sample.jpg"}
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
  );
}

