"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
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

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ATL-2026-001234",
    date: "3 Ocak 2026",
    status: "shipped",
    total: 4350,
    trackingNumber: "TR12345678901",
    estimatedDelivery: "8 Ocak 2026",
    items: [
      {
        id: "1",
        title: "Soyut Kompozisyon",
        artist: "Ayşe Demir",
        price: 3500,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop",
        slug: "soyut-kompozisyon",
      },
      {
        id: "2",
        title: "El Yapımı Seramik Vazo",
        artist: "Mehmet Demir",
        price: 850,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop",
        slug: "el-yapimi-seramik-vazo",
      },
    ],
  },
  {
    id: "2",
    orderNumber: "ATL-2025-009876",
    date: "15 Aralık 2025",
    status: "delivered",
    total: 2800,
    items: [
      {
        id: "3",
        title: "Mavi Harmoni",
        artist: "Mehmet Kaya",
        price: 2800,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=200&h=200&fit=crop",
        slug: "mavi-harmoni",
      },
    ],
  },
  {
    id: "3",
    orderNumber: "ATL-2025-008765",
    date: "1 Aralık 2025",
    status: "delivered",
    total: 1200,
    items: [
      {
        id: "4",
        title: "Cam Takı Seti",
        artist: "Emre Arslan",
        price: 1200,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop",
        slug: "cam-taki-seti",
      },
    ],
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  pending: { label: "Onay Bekliyor", color: "bg-yellow-100 text-yellow-700", icon: "schedule" },
  processing: { label: "Hazırlanıyor", color: "bg-blue-100 text-blue-700", icon: "inventory" },
  shipped: { label: "Kargoda", color: "bg-purple-100 text-purple-700", icon: "local_shipping" },
  delivered: { label: "Teslim Edildi", color: "bg-green-100 text-green-700", icon: "check_circle" },
  cancelled: { label: "İptal Edildi", color: "bg-red-100 text-red-700", icon: "cancel" },
};

export default function SiparislerimPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [orders] = useState<Order[]>(mockOrders);
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "completed">("all");

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
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

  if (isLoading) {
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
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6 h-fit">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                  {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-text-charcoal">
                  {user?.user_metadata?.full_name || "Kullanıcı"}
                </p>
                <p className="text-sm text-text-secondary truncate max-w-[150px]">{user?.email}</p>
              </div>
            </div>
            <nav className="space-y-2">
              <Link href="/hesap" className="block px-4 py-2 text-text-charcoal hover:bg-background-ivory rounded-md transition-colors">
                Profilim
              </Link>
              <Link href="/siparislerim" className="block px-4 py-2 bg-primary/10 text-primary rounded-md font-medium">
                Siparişlerim
              </Link>
              <Link href="/adreslerim" className="block px-4 py-2 text-text-charcoal hover:bg-background-ivory rounded-md transition-colors">
                Adreslerim
              </Link>
              <Link href="/favoriler" className="block px-4 py-2 text-text-charcoal hover:bg-background-ivory rounded-md transition-colors">
                Favorilerim
              </Link>
              <Link href="/ayarlar" className="block px-4 py-2 text-text-charcoal hover:bg-background-ivory rounded-md transition-colors">
                Ayarlar
              </Link>
              <hr className="border-border-subtle my-2" />
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Çıkış Yap
              </button>
            </nav>
          </div>

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

