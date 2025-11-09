"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [searchType, setSearchType] = useState<"order" | "tracking">("order");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === "order" && orderId) {
      router.push(`/orders?orderId=${orderId}`);
    } else if (searchType === "tracking" && trackingCode) {
      // Tracking code ile arama yapılabilir, şimdilik orders sayfasına yönlendir
      router.push(`/orders?tracking=${trackingCode}`);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-[#1F2937] mb-4">Sipariş Takibi</h1>
                <p className="text-gray-600 mb-8">
                  Sipariş numaranız veya kargo takip kodunuz ile siparişinizin durumunu öğrenebilirsiniz.
                </p>

                {/* Arama Türü Seçimi */}
                <div className="mb-6">
                  <div className="flex gap-4 border-b border-gray-200">
                    <button
                      onClick={() => setSearchType("order")}
                      className={`px-4 py-2 font-medium transition-colors ${
                        searchType === "order"
                          ? "text-[#D97706] border-b-2 border-[#D97706]"
                          : "text-gray-600 hover:text-[#D97706]"
                      }`}
                    >
                      Sipariş Numarası
                    </button>
                    <button
                      onClick={() => setSearchType("tracking")}
                      className={`px-4 py-2 font-medium transition-colors ${
                        searchType === "tracking"
                          ? "text-[#D97706] border-b-2 border-[#D97706]"
                          : "text-gray-600 hover:text-[#D97706]"
                      }`}
                    >
                      Kargo Takip Kodu
                    </button>
                  </div>
                </div>

                {/* Arama Formu */}
                <form onSubmit={handleSearch} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
                  {searchType === "order" ? (
                    <div>
                      <label htmlFor="orderId" className="block text-sm font-medium text-[#1F2937] mb-2">
                        Sipariş Numarası
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="orderId"
                          type="text"
                          value={orderId}
                          onChange={(e) => setOrderId(e.target.value)}
                          placeholder="Örn: clx1234567890"
                          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                          required
                        />
                        <button
                          type="submit"
                          className="px-6 py-3 bg-[#D97706] text-white rounded-lg hover:bg-[#92400E] transition-colors font-medium"
                        >
                          Ara
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Sipariş numaranızı sipariş onay e-postanızdan veya{" "}
                        <Link href="/orders" className="text-[#D97706] hover:underline">
                          Siparişlerim
                        </Link>{" "}
                        sayfasından bulabilirsiniz.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="trackingCode" className="block text-sm font-medium text-[#1F2937] mb-2">
                        Kargo Takip Kodu
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="trackingCode"
                          type="text"
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                          placeholder="Örn: PTT123456789TR"
                          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                          required
                        />
                        <button
                          type="submit"
                          className="px-6 py-3 bg-[#D97706] text-white rounded-lg hover:bg-[#92400E] transition-colors font-medium"
                        >
                          Ara
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Kargo takip kodunuz, siparişiniz kargoya verildiğinde size SMS ve e-posta ile gönderilir.
                      </p>
                    </div>
                  )}
                </form>

                {/* Bilgilendirme */}
                <div className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <h3 className="font-semibold text-blue-900 mb-2">Sipariş Durumları</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>Onay Bekliyor:</strong> Siparişiniz onay bekliyor</li>
                      <li>• <strong>Hazırlanıyor:</strong> Satıcı ürününüzü hazırlıyor</li>
                      <li>• <strong>Kargoya Verildi:</strong> Ürününüz kargoya verildi</li>
                      <li>• <strong>Teslim Edildi:</strong> Siparişiniz teslim edildi</li>
                      <li>• <strong>İptal Edildi:</strong> Sipariş iptal edildi</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-semibold text-[#1F2937] mb-3">Hızlı Erişim</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#D97706] hover:bg-[#D97706]/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[#D97706]">receipt_long</span>
                        <div>
                          <div className="font-medium text-[#1F2937]">Tüm Siparişlerim</div>
                          <div className="text-sm text-gray-600">Sipariş geçmişinizi görüntüleyin</div>
                        </div>
                      </Link>
                      <Link
                        href="/help"
                        className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#D97706] hover:bg-[#D97706]/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[#D97706]">help_outline</span>
                        <div>
                          <div className="font-medium text-[#1F2937]">Yardım Merkezi</div>
                          <div className="text-sm text-gray-600">Sık sorulan sorular</div>
                        </div>
                      </Link>
                      <Link
                        href="/contact"
                        className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#D97706] hover:bg-[#D97706]/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[#D97706]">mail_outline</span>
                        <div>
                          <div className="font-medium text-[#1F2937]">İletişim</div>
                          <div className="text-sm text-gray-600">Bizimle iletişime geçin</div>
                        </div>
                      </Link>
                      <Link
                        href="/shipping"
                        className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#D97706] hover:bg-[#D97706]/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[#D97706]">local_shipping</span>
                        <div>
                          <div className="font-medium text-[#1F2937]">Kargo Bilgileri</div>
                          <div className="text-sm text-gray-600">Teslimat süreleri ve ücretleri</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <h3 className="font-semibold text-yellow-900 mb-2">Not</h3>
                    <p className="text-sm text-yellow-800">
                      Giriş yapmış kullanıcılar,{" "}
                      <Link href="/orders" className="underline font-medium">
                        Siparişlerim
                      </Link>{" "}
                      sayfasından tüm siparişlerini görüntüleyebilir ve detaylı takip yapabilir.
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

