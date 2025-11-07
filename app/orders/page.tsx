import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import StartOrderConversationButton from "./StartOrderConversationButton";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const orders = await db.order.findMany({
    where: {
      userId: userId,
      status: { not: "CART" },
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sort: "asc" }, take: 1 },
                  seller: {
                    select: {
                      displayName: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusLabels: Record<string, string> = {
    PENDING: "Onay Bekliyor",
    PAID: "Hazırlanıyor",
    SHIPPED: "Kargoya Verildi",
    COMPLETED: "Teslim Edildi",
    CANCELED: "İptal Edildi",
  };

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    PENDING: {
      bg: "bg-yellow-100 dark:bg-yellow-900/50",
      text: "text-yellow-800 dark:text-yellow-300",
      dot: "bg-yellow-500",
    },
    PAID: {
      bg: "bg-orange-100 dark:bg-orange-900/50",
      text: "text-orange-800 dark:text-orange-300",
      dot: "bg-orange-500",
    },
    SHIPPED: {
      bg: "bg-blue-100 dark:bg-blue-900/50",
      text: "text-blue-800 dark:text-blue-300",
      dot: "bg-blue-500",
    },
    COMPLETED: {
      bg: "bg-green-100 dark:bg-green-900/50",
      text: "text-green-800 dark:text-green-300",
      dot: "bg-green-500",
    },
    CANCELED: {
      bg: "bg-red-100 dark:bg-red-900/50",
      text: "text-red-800 dark:text-red-300",
      dot: "bg-red-500",
    },
  };

  return (
    <div className="flex min-h-screen bg-[#f8f7f6] dark:bg-[#221810]">
      {/* Sidebar */}
      <aside className="w-80 bg-[#f8f7f6] dark:bg-[#221810] p-6 border-r border-[#ec6d13]/20 dark:border-[#ec6d13]/30">
        <nav className="flex flex-col space-y-2">
          <Link
            href="/orders"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#ec6d13]/10 dark:bg-[#ec6d13]/20 text-[#ec6d13]"
          >
            <span className="material-symbols-outlined">list_alt</span>
            <span className="font-medium">Siparişlerim</span>
          </Link>
          <Link
            href="/messages"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-black/70 dark:text-white/70 hover:bg-[#ec6d13]/10 dark:hover:bg-[#ec6d13]/20 hover:text-[#ec6d13] dark:hover:text-[#ec6d13]"
          >
            <span className="material-symbols-outlined">chat_bubble_outline</span>
            <span className="font-medium">Mesajlarım</span>
          </Link>
          <Link
            href="/favorites"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-black/70 dark:text-white/70 hover:bg-[#ec6d13]/10 dark:hover:bg-[#ec6d13]/20 hover:text-[#ec6d13] dark:hover:text-[#ec6d13]"
          >
            <span className="material-symbols-outlined">favorite_border</span>
            <span className="font-medium">Favorilerim</span>
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-black/70 dark:text-white/70 hover:bg-[#ec6d13]/10 dark:hover:bg-[#ec6d13]/20 hover:text-[#ec6d13] dark:hover:text-[#ec6d13]"
          >
            <span className="material-symbols-outlined">person_outline</span>
            <span className="font-medium">Profilim & Adreslerim</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-black/70 dark:text-white/70 hover:bg-[#ec6d13]/10 dark:hover:bg-[#ec6d13]/20 hover:text-[#ec6d13] dark:hover:text-[#ec6d13]"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-medium">Hesap Ayarları</span>
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-black/70 dark:text-white/70 hover:bg-[#ec6d13]/10 dark:hover:bg-[#ec6d13]/20 hover:text-[#ec6d13] dark:hover:text-[#ec6d13]"
          >
            <span className="material-symbols-outlined">help_outline</span>
            <span className="font-medium">Yardım & Destek</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display font-bold text-black/80 dark:text-white/80">Siparişlerim</h1>
        </div>

        <div className="mb-8">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50">
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#221810]/50 border border-black/10 dark:border-white/10 rounded-lg text-black/80 dark:text-white/80 placeholder-black/40 dark:placeholder-white/40 focus:ring-[#ec6d13] focus:border-[#ec6d13]"
              placeholder="Sipariş no, ürün veya satıcıya göre ara..."
              type="text"
            />
          </div>
        </div>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-[#221810]/50 rounded-xl shadow-sm border border-black/5 dark:border-white/5 p-12 text-center">
              <p className="text-black/60 dark:text-white/60 mb-4">Henüz siparişiniz yok</p>
              <Link
                href="/catalog"
                className="inline-block px-6 py-2 text-sm font-medium rounded-lg text-white bg-[#ec6d13] hover:bg-opacity-90"
              >
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              // Her sipariş için ilk item'ı göster
              const firstItem = order.items[0];
              if (!firstItem) return null;

              const product = firstItem.variant.product;
              const seller = product.seller;
              const statusInfo = statusColors[order.status] || statusColors.PENDING;
              const orderDate = new Date(order.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              // Bu siparişteki toplam tutar
              const orderTotal = order.items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-[#221810]/50 rounded-xl shadow-sm border border-black/5 dark:border-white/5 p-6 flex flex-col md:flex-row gap-6"
                >
                  <img
                    alt={product.title}
                    className="w-full md:w-48 h-48 object-cover rounded-lg"
                    src={product.images[0]?.url || "/uploads/sample.jpg"}
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-black/50 dark:text-white/50">
                            {orderDate} - #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <h2 className="text-xl font-bold font-display text-black/80 dark:text-white/80 mt-1">
                            {product.title}
                            {order.items.length > 1 && ` +${order.items.length - 1} ürün daha`}
                          </h2>
                          <p className="text-black/60 dark:text-white/60">
                            Satıcı:{" "}
                            <Link href={`/artist/${seller.id}`} className="text-[#ec6d13] hover:underline">
                              {seller.displayName}
                            </Link>
                          </p>
                        </div>
                        <p className="text-xl font-bold text-black/80 dark:text-white/80">
                          {(orderTotal / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}
                        >
                          <span className={`w-2 h-2 mr-2 ${statusInfo.dot} rounded-full`}></span>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                      {order.status === "SHIPPED" && (
                        <button className="px-6 py-2 text-sm font-medium rounded-lg text-white bg-[#ec6d13] hover:bg-opacity-90">
                          Kargoyu Takip Et
                        </button>
                      )}
                      {order.status === "COMPLETED" && (
                        <button className="px-6 py-2 text-sm font-medium rounded-lg text-white bg-[#ec6d13] hover:bg-opacity-90">
                          Yorum Yap & Puanla
                        </button>
                      )}
                      <StartOrderConversationButton orderId={order.id} sellerId={seller.id} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

