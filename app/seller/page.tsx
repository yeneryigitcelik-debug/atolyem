import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import CreateSellerForm from "./CreateSellerForm";
import Link from "next/link";
import Header from "@/app/components/Header";

/**
 * Seller Dashboard v1
 * Shows new orders, pending shipments, and weekly sales/commission reports
 */
export default async function SellerPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { seller: true },
  });

  if (!user?.seller) {
    return <CreateSellerForm user={user} />;
  }

  const sellerId = user.seller.id;
  const commissionBps = user.seller.commissionBps || 1500; // Default 15%

  // Get seller's product IDs
  const sellerProducts = await db.product.findMany({
    where: { sellerId },
    select: { id: true },
  });
  const productIds = sellerProducts.map((p) => p.id);

  // Get seller's variant IDs
  const sellerVariants = await db.variant.findMany({
    where: { productId: { in: productIds } },
    select: { id: true },
  });
  const variantIds = sellerVariants.map((v) => v.id);

  // New orders (PENDING, PAID) - last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const newOrders = await db.order.findMany({
    where: {
      status: { in: ["PENDING", "PAID"] },
      items: {
        some: {
          variantId: { in: variantIds },
        },
      },
      createdAt: { gte: sevenDaysAgo },
    },
    include: {
      items: {
        where: {
          variantId: { in: variantIds },
        },
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
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Pending shipments (SHIPPED with CREATED or IN_TRANSIT status)
  const pendingShipments = await db.order.findMany({
    where: {
      status: "SHIPPED",
      items: {
        some: {
          variantId: { in: variantIds },
        },
      },
      shipments: {
        some: {
          status: { in: ["CREATED", "IN_TRANSIT"] },
        },
      },
    },
    include: {
      items: {
        where: {
          variantId: { in: variantIds },
        },
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
      shipments: {
        where: {
          status: { in: ["CREATED", "IN_TRANSIT"] },
        },
        orderBy: { createdAt: "desc" },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Weekly sales & commission (last 7 days, COMPLETED orders)
  const weeklyCompletedOrders = await db.order.findMany({
    where: {
      status: "COMPLETED",
      items: {
        some: {
          variantId: { in: variantIds },
        },
      },
      createdAt: { gte: sevenDaysAgo },
    },
    include: {
      items: {
        where: {
          variantId: { in: variantIds },
        },
      },
    },
  });

  // Calculate weekly stats
  let weeklySalesCents = 0;
  let weeklyCommissionCents = 0;
  let weeklyOrderCount = 0;

  weeklyCompletedOrders.forEach((order) => {
    const sellerItems = order.items.filter((item) =>
      variantIds.includes(item.variantId)
    );
    const sellerTotalCents = sellerItems.reduce(
      (sum, item) => sum + item.priceCents * item.qty,
      0
    );
    weeklySalesCents += sellerTotalCents;
    weeklyCommissionCents += Math.floor(
      (sellerTotalCents * commissionBps) / 10000
    );
    if (sellerItems.length > 0) {
      weeklyOrderCount++;
    }
  });

  // Get recent payout ledger entries
  const recentLedgerEntries = await db.sellerPayoutLedger.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <Header />

            <main className="flex-1 my-8">
              <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-[#1F2937] mb-2">
                    Satıcı Paneli
                  </h1>
                  <p className="text-gray-600">
                    Hoş geldiniz, {user.seller.displayName}
                  </p>
                </div>

                {/* Weekly Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Haftalık Satış
                    </h3>
                    <p className="text-2xl font-bold text-[#1F2937]">
                      {(weeklySalesCents / 100).toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {weeklyOrderCount} sipariş
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Haftalık Komisyon
                    </h3>
                    <p className="text-2xl font-bold text-[#D97706]">
                      {(weeklyCommissionCents / 100).toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      %{(commissionBps / 100).toFixed(1)} komisyon oranı
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Bekleyen Kargo
                    </h3>
                    <p className="text-2xl font-bold text-[#1F2937]">
                      {pendingShipments.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Kargoda bekleyen sipariş
                    </p>
                  </div>
                </div>

                {/* New Orders */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-[#1F2937]">
                      Yeni Siparişler
                    </h2>
                    <Link
                      href="/seller/orders"
                      className="text-sm text-[#D97706] hover:underline"
                    >
                      Tümünü Gör →
                    </Link>
                  </div>
                  {newOrders.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                      <p className="text-gray-600">Yeni sipariş bulunmamaktadır.</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                      <div className="divide-y divide-gray-200">
                        {newOrders.map((order) => {
                          const sellerItems = order.items.filter((item) =>
                            variantIds.includes(item.variantId)
                          );
                          const sellerTotalCents = sellerItems.reduce(
                            (sum, item) => sum + item.priceCents * item.qty,
                            0
                          );

                          return (
                            <div
                              key={order.id}
                              className="p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-medium text-[#1F2937]">
                                      Sipariş #{order.id.slice(-8)}
                                    </span>
                                    <span
                                      className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                                        order.status === "PENDING"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {order.status === "PENDING"
                                        ? "Onay Bekliyor"
                                        : "Ödendi"}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {order.user.name || order.user.email}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(order.createdAt).toLocaleDateString(
                                      "tr-TR"
                                    )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-[#1F2937]">
                                    {(sellerTotalCents / 100).toLocaleString(
                                      "tr-TR",
                                      {
                                        style: "currency",
                                        currency: "TRY",
                                      }
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {sellerItems.length} ürün
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pending Shipments */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-[#1F2937]">
                      Kargo Bekleyenler
                    </h2>
                    <Link
                      href="/seller/shipments"
                      className="text-sm text-[#D97706] hover:underline"
                    >
                      Tümünü Gör →
                    </Link>
                  </div>
                  {pendingShipments.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                      <p className="text-gray-600">
                        Kargo bekleyen sipariş bulunmamaktadır.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                      <div className="divide-y divide-gray-200">
                        {pendingShipments.map((order) => {
                          const sellerItems = order.items.filter((item) =>
                            variantIds.includes(item.variantId)
                          );
                          const latestShipment = order.shipments[0];

                          return (
                            <div
                              key={order.id}
                              className="p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-medium text-[#1F2937]">
                                      Sipariş #{order.id.slice(-8)}
                                    </span>
                                    <span className="inline-flex rounded-full px-2 text-xs font-semibold bg-green-100 text-green-800">
                                      Kargoda
                                    </span>
                                  </div>
                                  {latestShipment && (
                                    <p className="text-sm text-gray-600">
                                      {latestShipment.carrier} -{" "}
                                      {latestShipment.trackingCode}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(order.createdAt).toLocaleDateString(
                                      "tr-TR"
                                    )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">
                                    {sellerItems.length} ürün
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/seller/products"
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-[#1F2937] mb-2">
                      Ürünlerim
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ürünlerinizi yönetin ve yeni ürün ekleyin
                    </p>
                  </Link>

                  <Link
                    href="/seller/orders"
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-[#1F2937] mb-2">
                      Tüm Siparişler
                    </h3>
                    <p className="text-sm text-gray-600">
                      Tüm siparişlerinizi görüntüleyin
                    </p>
                  </Link>

                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="font-semibold text-[#1F2937] mb-2">
                      Mesaj Kutusu
                    </h3>
                    <p className="text-sm text-gray-600">
                      Yakında eklenecek
                    </p>
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
