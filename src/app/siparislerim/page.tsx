"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import AccountSidebar from "@/components/layout/AccountSidebar";
import Link from "next/link";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: {
    id: string;
    title: string;
    artist: string;
    price: number;
    quantity: number;
    image: string;
    slug: string;
  }[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

// Orders will be fetched from API

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  pending: { label: "Onay Bekliyor", color: "bg-yellow-100 text-yellow-700", icon: "schedule" },
  processing: { label: "Hazırlanıyor", color: "bg-blue-100 text-blue-700", icon: "inventory" },
  shipped: { label: "Kargoda", color: "bg-purple-100 text-purple-700", icon: "local_shipping" },
  delivered: { label: "Teslim Edildi", color: "bg-green-100 text-green-700", icon: "check_circle" },
  cancelled: { label: "İptal Edildi", color: "bg-red-100 text-red-700", icon: "cancel" },
};

export default function SiparislerimPage() {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    if (!isLoading && user) {
      fetchOrders();
    } else if (!isLoading && !user) {
      setLoading(false);
    }
  }, [user, isLoading]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        // Transform API response to match Order interface
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedOrders: Order[] = data.orders.map((order: Record<string, any>) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          date: new Date(order.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
          status: order.status.toLowerCase().replace("_", "-") as OrderStatus,
          total: order.grandTotalMinor / 100,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: order.items.map((item: Record<string, any>) => ({
            id: item.id,
            title: item.titleSnapshot,
            artist: item.shopId, // Will need shop name from API
            price: item.unitPriceMinor / 100,
            quantity: item.quantity,
            image: "", // Will need from listing
            slug: item.listing.slug || "",
          })),
          trackingNumber: order.items[0]?.trackingNumber,
          estimatedDelivery: order.items[0]?.estimatedShipByDate 
            ? new Date(order.items[0].estimatedShipByDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
            : undefined,
        }));
        setOrders(transformedOrders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoading && !user) {
    return (
      <>
        <PageHeader title="Siparişlerim" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">login</span>
            </div>
            <h2 className="text-xl font-bold text-text-charcoal mb-2">Giriş Yapın</h2>
            <p className="text-text-secondary mb-8">Siparişlerinizi görmek için hesabınıza giriş yapın.</p>
            <Link 
              href="/hesap" 
              className="inline-flex px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (isLoading || loading) {
    return (
      <>
        <PageHeader title="Siparişlerim" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-text-secondary mt-4">Yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (selectedTab === "active") return ["pending", "processing", "shipped"].includes(order.status);
    if (selectedTab === "completed") return ["delivered", "cancelled"].includes(order.status);
    return true;
  });

  return (
    <>
      <PageHeader title="Siparişlerim" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <AccountSidebar activePage="siparislerim" />

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-border-subtle">
              <button
                onClick={() => setSelectedTab("all")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  selectedTab === "all"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-text-charcoal"
                }`}
              >
                Tüm Siparişler
              </button>
              <button
                onClick={() => setSelectedTab("active")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  selectedTab === "active"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-text-charcoal"
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setSelectedTab("completed")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  selectedTab === "completed"
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-text-charcoal"
                }`}
              >
                Tamamlanan
              </button>
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden">
                    {/* Order Header */}
                    <div className="p-4 bg-background-ivory border-b border-border-subtle flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-text-secondary">Sipariş No</p>
                          <p className="font-semibold text-text-charcoal">{order.orderNumber}</p>
                        </div>
                        <div className="h-8 w-px bg-border-subtle hidden sm:block" />
                        <div className="hidden sm:block">
                          <p className="text-sm text-text-secondary">Tarih</p>
                          <p className="font-medium text-text-charcoal">{order.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig[order.status].color}`}>
                          <span className="material-symbols-outlined text-[16px]">{statusConfig[order.status].icon}</span>
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <Link href={`/urun/${item.slug}`} className="shrink-0">
                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                              <div
                                className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform"
                                style={{ backgroundImage: `url('${item.image}')` }}
                              />
                            </div>
                          </Link>
                          <div className="flex-grow min-w-0">
                            <Link href={`/urun/${item.slug}`}>
                              <h4 className="font-medium text-text-charcoal hover:text-primary transition-colors line-clamp-1">
                                {item.title}
                              </h4>
                            </Link>
                            <p className="text-sm text-text-secondary">{item.artist}</p>
                            <p className="text-sm text-text-charcoal mt-1">
                              {item.quantity} adet × {item.price.toLocaleString("tr-TR")} ₺
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info */}
                    {order.status === "shipped" && order.trackingNumber && (
                      <div className="px-4 py-3 bg-purple-50 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="material-symbols-outlined text-purple-600 text-[18px]">local_shipping</span>
                          <span className="text-purple-700">Takip No: <strong>{order.trackingNumber}</strong></span>
                        </div>
                        {order.estimatedDelivery && (
                          <span className="text-sm text-purple-600">
                            Tahmini Teslim: {order.estimatedDelivery}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Order Footer */}
                    <div className="p-4 border-t border-border-subtle flex items-center justify-between">
                      <div>
                        <span className="text-sm text-text-secondary">Toplam:</span>
                        <span className="ml-2 font-bold text-text-charcoal">{order.total.toLocaleString("tr-TR")} ₺</span>
                      </div>
                      <div className="flex gap-2">
                        {order.status === "delivered" && (
                          <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors">
                            Değerlendir
                          </button>
                        )}
                        <button className="px-4 py-2 text-sm font-medium border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-lg transition-colors">
                          Detayları Gör
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">shopping_bag</span>
                <h2 className="text-xl font-bold text-text-charcoal mb-2">Henüz sipariş yok</h2>
                <p className="text-text-secondary mb-8">Harika eserleri keşfetmeye başlayın.</p>
                <Link href="/kesfet" className="inline-flex px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors">
                  Keşfetmeye Başla
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
