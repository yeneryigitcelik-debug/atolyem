import Link from "next/link";
import { db } from "@/lib/db";

export default async function ArtistsPage() {
  const sellers = await db.seller.findMany({
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
        take: 1,
        include: {
          images: { orderBy: { sort: "asc" }, take: 1 },
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
                <h1 className="text-4xl font-bold text-[#1F2937] mb-4">Sanatçılarla Tanışın</h1>
                <p className="text-gray-600 mb-8">
                  Platformumuzdaki yetenekli sanatçıları ve zanaatkarları keşfedin. Her biri kendi özgün eserlerini yaratıyor.
                </p>

                {sellers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Henüz sanatçı bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sellers.map((seller) => {
                      const userImage = seller.user.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuDDoFd-5Lopq13T-VJrLgwgSt7uH3WDYxeEUTgjk2BUXy1HdMKoQ7Aftco9cHpc54mE-kkrDTu7DAjHnYauF54_iNFcTp9woSfkGwN0Dc9TRU_xslY2zqg2Vmm4qVCMnBnCKi1vu0bRR9aUoVF4mvYVeTdxifsNl49PQTKOhWb4fJJkjqZlXeWZSdinHELFarnoPT3p_jgD0JzCHE-SNsUl2cE9DP59vnhW2zncJ2ygxHzkjImID2c0-caDfiSMSn8H7rycDNSHCn0w";
                      const productImage = seller.products[0]?.images[0]?.url || "https://via.placeholder.com/400x400?text=Görsel+Yok";
                      
                      return (
                        <Link
                          key={seller.id}
                          href={`/artist/${seller.id}`}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-square w-full overflow-hidden bg-gray-100">
                            <img
                              src={productImage}
                              alt={seller.displayName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-white"
                                style={{ backgroundImage: `url("${userImage}")` }}
                              />
                              <div>
                                <h3 className="font-bold text-[#1F2937]">{seller.displayName}</h3>
                                <p className="text-sm text-gray-500">{seller.user.name || seller.user.email}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {seller.products.length} {seller.products.length === 1 ? "eser" : "eser"}
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

