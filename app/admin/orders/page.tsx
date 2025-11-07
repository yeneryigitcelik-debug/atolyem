import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    where: { status: { not: "CART" } },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sort: "asc" }, take: 1 },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statusLabels: Record<string, string> = {
    PENDING: "Beklemede",
    PAID: "Ödendi",
    SHIPPED: "Kargoda",
    COMPLETED: "Tamamlandı",
    CANCELED: "İptal Edildi",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-[#D97706]/10 text-[#92400E]",
    SHIPPED: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELED: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
              <p className="text-sm text-gray-600">Tüm siparişleri görüntüle ve yönet</p>
            </div>
            <Link
              href="/admin"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Geri Dön
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {orders.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-600">Henüz sipariş bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">Sipariş #{order.id.slice(0, 8)}</div>
                    <div className="text-sm text-gray-500">
                      {order.user.name || order.user.email} - {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                    <div className="text-lg font-semibold text-gray-900">
                      {(order.totalCents / 100).toLocaleString("tr-TR")} TL
                    </div>
                  </div>
                </div>
                <div className="space-y-2 border-t border-gray-200 pt-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.variant.product.images[0]?.url ?? "/uploads/sample.jpg"}
                          alt={item.variant.product.images[0]?.alt ?? item.variant.product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.variant.product.slug}`}
                          className="font-medium text-gray-900 hover:text-[#D97706]"
                        >
                          {item.variant.product.title}
                        </Link>
                        <div className="text-sm text-gray-500">
                          {item.variant.sku} x {item.qty}
                        </div>
                      </div>
                      <div className="font-medium text-gray-900">
                        {((item.priceCents * item.qty) / 100).toLocaleString("tr-TR")} TL
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

