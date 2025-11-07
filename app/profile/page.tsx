import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      seller: true,
      orders: {
        where: { status: { not: "CART" } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { take: 1 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const orderCount = await db.order.count({
    where: {
      userId: user.id,
      status: { not: "CART" },
    },
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF8F1" }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <Header />

            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold text-[#1F2937]">Profilim</h1>
                  <Link
                    href={`/user/${userId}`}
                    className="rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E] transition-colors text-sm font-medium"
                  >
                    Genel Profilimi Görüntüle
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Kullanıcı Bilgileri */}
                  <div className="md:col-span-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Kişisel Bilgiler</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                        <p className="text-[#1F2937]">{user.name || "Belirtilmemiş"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                        <p className="text-[#1F2937]">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <p className="text-[#1F2937]">
                          {user.role === "ADMIN" && "Yönetici"}
                          {user.role === "SELLER" && "Satıcı"}
                          {user.role === "CUSTOMER" && "Müşteri"}
                        </p>
                      </div>
                      {user.seller && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Satıcı Adı</label>
                          <p className="text-[#1F2937]">{user.seller.displayName}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* İstatistikler */}
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[#1F2937] mb-4">İstatistikler</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Toplam Sipariş</p>
                        <p className="text-2xl font-bold text-[#1F2937]">{orderCount}</p>
                      </div>
                      {user.seller && (
                        <div>
                          <p className="text-sm text-gray-600">Ürün Sayısı</p>
                          <p className="text-2xl font-bold text-[#1F2937]">
                            {await db.product.count({ where: { sellerId: user.seller.id } })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Son Siparişler */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[#1F2937]">Son Siparişler</h2>
                    {orderCount > 0 && (
                      <Link
                        href="/orders"
                        className="text-sm text-[#D97706] hover:text-[#92400E] font-medium"
                      >
                        Tümünü Gör
                      </Link>
                    )}
                  </div>
                  {user.orders.length === 0 ? (
                    <p className="text-gray-600">Henüz siparişiniz yok.</p>
                  ) : (
                    <div className="space-y-4">
                      {user.orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {order.items[0]?.variant?.product?.images[0] && (
                              <img
                                src={order.items[0].variant.product.images[0].url}
                                alt={order.items[0].variant.product.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-[#1F2937]">
                                {order.items.length} ürün
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                              </p>
                              <p className="text-sm text-gray-500">
                                {(order.totalCents / 100).toLocaleString("tr-TR")} TL
                              </p>
                            </div>
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === "PAID"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "SHIPPED"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "COMPLETED"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status === "PAID" && "Ödendi"}
                              {order.status === "SHIPPED" && "Kargoda"}
                              {order.status === "COMPLETED" && "Tamamlandı"}
                              {order.status === "PENDING" && "Beklemede"}
                              {order.status === "CANCELED" && "İptal"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hızlı Erişim */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.role === "SELLER" || user.role === "ADMIN" ? (
                    <Link
                      href="/seller"
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-[#1F2937] mb-2">Satıcı Paneli</h3>
                      <p className="text-sm text-gray-600">Ürünlerinizi yönetin</p>
                    </Link>
                  ) : (
                    <Link
                      href="/seller"
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-[#1F2937] mb-2">Satıcı Ol</h3>
                      <p className="text-sm text-gray-600">Atölyenizi oluşturun ve ürün satmaya başlayın</p>
                    </Link>
                  )}

                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-[#1F2937] mb-2">Admin Paneli</h3>
                      <p className="text-sm text-gray-600">Sistem yönetimi</p>
                    </Link>
                  )}

                  <Link
                    href="/orders"
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-[#1F2937] mb-2">Siparişlerim</h3>
                    <p className="text-sm text-gray-600">Tüm siparişlerinizi görüntüleyin</p>
                  </Link>

                  <Link
                    href="/cart"
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-[#1F2937] mb-2">Sepetim</h3>
                    <p className="text-sm text-gray-600">Sepetinizi görüntüleyin</p>
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

