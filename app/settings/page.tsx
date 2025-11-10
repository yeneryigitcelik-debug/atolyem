import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import AddressManager from "../profile/_components/AddressManager";

export default async function SettingsPage() {
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
            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[#1F2937] mb-8">Hesap Ayarları</h1>

                <div className="space-y-6">
                  {/* Kişisel Bilgiler */}
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
                    <div className="grid grid-cols-2 gap-4">
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

                  {/* Son Siparişler */}
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
                      <div className="space-y-3">
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

                  {/* Adres Yönetimi */}
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <AddressManager />
                  </div>

                  {/* Güvenlik */}
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Güvenlik</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Şifre değiştirme özelliği yakında eklenecek.</p>
                        <button
                          disabled
                          className="px-4 py-2 text-sm font-medium rounded-lg text-gray-400 bg-gray-100 cursor-not-allowed"
                        >
                          Şifre Değiştir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bildirimler */}
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Bildirimler</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#1F2937]">E-posta Bildirimleri</p>
                          <p className="text-xs text-gray-500">Sipariş ve mesaj bildirimlerini e-posta ile al</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#D97706] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D97706]"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#1F2937]">SMS Bildirimleri</p>
                          <p className="text-xs text-gray-500">Önemli güncellemeleri SMS ile al</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#D97706] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D97706]"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Dil ve Bölge */}
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Dil ve Bölge</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dil</label>
                        <select className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20">
                          <option value="tr">Türkçe</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Para Birimi</label>
                        <select className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20">
                          <option value="TRY">₺ Türk Lirası (TRY)</option>
                          <option value="EUR">€ Euro (EUR)</option>
                          <option value="USD">$ US Dollar (USD)</option>
                        </select>
                      </div>
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

