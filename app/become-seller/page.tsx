import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BecomeSellerPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto px-4">
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-bold text-[#1F2937] mb-4">
                    Atölyem.net'te Satıcı Olun
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    El yapımı eserlerinizi binlerce müşteriye ulaştırın. Tutkunuzu işe dönüştürün.
                  </p>
                  {userId ? (
                    <Link
                      href="/seller"
                      className="inline-block px-8 py-4 bg-[#D97706] text-white rounded-lg hover:bg-[#92400E] transition-colors font-bold text-lg"
                    >
                      Satıcı Hesabı Oluştur
                    </Link>
                  ) : (
                    <div className="flex gap-4 justify-center">
                      <Link
                        href="/register"
                        className="inline-block px-8 py-4 bg-[#D97706] text-white rounded-lg hover:bg-[#92400E] transition-colors font-bold text-lg"
                      >
                        Hemen Başla
                      </Link>
                      <Link
                        href="/login"
                        className="inline-block px-8 py-4 border-2 border-[#D97706] text-[#D97706] rounded-lg hover:bg-[#D97706]/10 transition-colors font-bold text-lg"
                      >
                        Giriş Yap
                      </Link>
                    </div>
                  )}
                </div>

                {/* Avantajlar */}
                <section className="mb-12">
                  <h2 className="text-3xl font-bold text-[#1F2937] mb-8 text-center">Neden Atölyem.net?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <div className="text-4xl mb-4">🎨</div>
                      <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Geniş Kitle</h3>
                      <p className="text-gray-600">
                        El yapımı ürünlere ilgi duyan binlerce müşteriye ulaşın. Pazarlama ve tanıtım işlerini biz hallediyoruz.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <div className="text-4xl mb-4">💰</div>
                      <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Adil Komisyon</h3>
                      <p className="text-gray-600">
                        %15 komisyon oranı ile rekabetçi fiyatlandırma. Ödemeleriniz düzenli olarak hesabınıza aktarılır.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <div className="text-4xl mb-4">🚀</div>
                      <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Kolay Yönetim</h3>
                      <p className="text-gray-600">
                        Kullanıcı dostu panel ile ürünlerinizi kolayca yönetin, siparişleri takip edin ve raporları görüntüleyin.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <div className="text-4xl mb-4">📦</div>
                      <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Güvenli Ödeme</h3>
                      <p className="text-gray-600">
                        Tüm ödemeler güvenli altyapılar üzerinden yapılır. Müşteri ödemelerini biz toplar, siz sadece üretin.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <div className="text-4xl mb-4">💬</div>
                      <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Müşteri Desteği</h3>
                      <p className="text-gray-600">
                        Müşteri soruları ve sipariş yönetimi için entegre mesajlaşma sistemi. Her zaman yanınızdayız.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Detaylı Raporlar</h3>
                      <p className="text-gray-600">
                        Satış, komisyon ve performans raporlarınızı anlık olarak görüntüleyin. İşinizi veri ile büyütün.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Nasıl Çalışır */}
                <section className="mb-12">
                  <h2 className="text-3xl font-bold text-[#1F2937] mb-8 text-center">Nasıl Çalışır?</h2>
                  <div className="space-y-6">
                    <div className="flex gap-6 items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#D97706] text-white rounded-full flex items-center justify-center font-bold text-xl">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Hesap Oluşturun</h3>
                        <p className="text-gray-600">
                          Ücretsiz olarak kayıt olun ve satıcı hesabınızı oluşturun. Sadece birkaç dakika sürer.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6 items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#D97706] text-white rounded-full flex items-center justify-center font-bold text-xl">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Ürünlerinizi Ekleyin</h3>
                        <p className="text-gray-600">
                          Ürün fotoğraflarınızı yükleyin, açıklamalarınızı yazın ve fiyatlandırın. Kolay ve hızlı.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6 items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#D97706] text-white rounded-full flex items-center justify-center font-bold text-xl">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Satışa Başlayın</h3>
                        <p className="text-gray-600">
                          Ürünleriniz platformda görünür hale gelir. Müşteriler sipariş verir, siz üretir ve gönderirsiniz.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6 items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#D97706] text-white rounded-full flex items-center justify-center font-bold text-xl">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Ödemenizi Alın</h3>
                        <p className="text-gray-600">
                          Siparişler tamamlandıktan sonra ödemeleriniz düzenli olarak hesabınıza aktarılır.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Komisyon ve Ücretler */}
                <section className="mb-12 bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                  <h2 className="text-3xl font-bold text-[#1F2937] mb-6 text-center">Komisyon ve Ücretler</h2>
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-[#D97706]/10 rounded-lg p-6 mb-6">
                      <div className="text-center mb-4">
                        <div className="text-5xl font-bold text-[#D97706] mb-2">%15</div>
                        <div className="text-gray-600">Komisyon Oranı</div>
                      </div>
                      <p className="text-center text-gray-700">
                        Her satıştan sadece %15 komisyon alıyoruz. Başka gizli ücret yok!
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700">Üyelik Ücreti</span>
                        <span className="font-semibold text-[#1F2937]">Ücretsiz</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700">Listeleme Ücreti</span>
                        <span className="font-semibold text-[#1F2937]">Ücretsiz</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700">Komisyon Oranı</span>
                        <span className="font-semibold text-[#1F2937]">%15</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-700">Ödeme İşlem Ücreti</span>
                        <span className="font-semibold text-[#1F2937]">Ücretsiz</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SSS */}
                <section className="mb-12">
                  <h2 className="text-3xl font-bold text-[#1F2937] mb-8 text-center">Sık Sorulan Sorular</h2>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="font-semibold text-[#1F2937] mb-2">Satıcı olmak için ücret ödemem gerekiyor mu?</h3>
                      <p className="text-gray-600">
                        Hayır, üyelik ve listeleme tamamen ücretsizdir. Sadece satış yaptığınızda %15 komisyon alınır.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="font-semibold text-[#1F2937] mb-2">Ödemeleri ne zaman alırım?</h3>
                      <p className="text-gray-600">
                        Siparişler tamamlandıktan (teslim edildikten) sonra, ödemeleriniz düzenli olarak hesabınıza aktarılır.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="font-semibold text-[#1F2937] mb-2">Hangi ürünleri satabilirim?</h3>
                      <p className="text-gray-600">
                        El yapımı, özgün sanat eserleri ve zanaat ürünleri satabilirsiniz. Telif hakkı ihlali yapan ürünler yasaktır.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="font-semibold text-[#1F2937] mb-2">Kargo işlemlerini nasıl yönetirim?</h3>
                      <p className="text-gray-600">
                        Siparişleri hazırladıktan sonra, platform üzerinden kargo bilgilerini girebilir ve müşteriye bildirim gönderebilirsiniz.
                      </p>
                    </div>
                  </div>
                </section>

                {/* CTA */}
                <section className="text-center bg-gradient-to-r from-[#D97706] to-[#92400E] rounded-lg p-12 text-white">
                  <h2 className="text-3xl font-bold mb-4">Hemen Başlayın</h2>
                  <p className="text-xl mb-8 opacity-90">
                    Binlerce sanatsever sizin eserlerinizi bekliyor. Hemen satıcı hesabınızı oluşturun!
                  </p>
                  {userId ? (
                    <Link
                      href="/seller"
                      className="inline-block px-8 py-4 bg-white text-[#D97706] rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
                    >
                      Satıcı Paneline Git
                    </Link>
                  ) : (
                    <div className="flex gap-4 justify-center">
                      <Link
                        href="/register"
                        className="inline-block px-8 py-4 bg-white text-[#D97706] rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
                      >
                        Ücretsiz Kayıt Ol
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-block px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-bold text-lg"
                      >
                        Daha Fazla Bilgi
                      </Link>
                    </div>
                  )}
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

