import Header from "@/app/components/Header";

export default function PrivacyPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <Header />

            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-[#1F2937] mb-8">Gizlilik Politikası</h1>
                
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-sm text-gray-500">Son Güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</p>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">1. Genel Bilgiler</h2>
                    <p>
                      Atölyem.net olarak, kullanıcılarımızın gizliliğini korumak bizim için önceliklidir. 
                      Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını, 
                      saklandığını ve korunduğunu açıklamaktadır.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">2. Toplanan Bilgiler</h2>
                    <p className="mb-2">Topladığımız bilgiler şunları içerir:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Ad, soyad, e-posta adresi</li>
                      <li>Telefon numarası (isteğe bağlı)</li>
                      <li>Fatura ve teslimat adresi</li>
                      <li>Ödeme bilgileri (güvenli ödeme sağlayıcıları üzerinden)</li>
                      <li>Tarayıcı ve cihaz bilgileri</li>
                      <li>IP adresi ve konum bilgisi</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">3. Bilgilerin Kullanımı</h2>
                    <p className="mb-2">Kişisel bilgileriniz şu amaçlarla kullanılır:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Siparişlerinizin işlenmesi ve teslimi</li>
                      <li>Hesap yönetimi ve müşteri desteği</li>
                      <li>Ürün ve hizmet geliştirme</li>
                      <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                      <li>Pazarlama ve iletişim (izin verdiğiniz takdirde)</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">4. Veri Güvenliği</h2>
                    <p>
                      Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz. 
                      Verileriniz şifrelenmiş bağlantılar üzerinden iletilir ve güvenli sunucularda saklanır.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">5. Çerezler</h2>
                    <p>
                      Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanır. 
                      Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">6. Haklarınız</h2>
                    <p className="mb-2">KVKK kapsamında sahip olduğunuz haklar:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Kişisel verilerinize erişim</li>
                      <li>Düzeltme ve silme talebi</li>
                      <li>İtiraz etme hakkı</li>
                      <li>Veri taşınabilirliği</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">7. İletişim</h2>
                    <p>
                      Gizlilik politikamız hakkında sorularınız için{" "}
                      <a href="/contact" className="text-[#D97706] hover:underline">
                        iletişim sayfamızdan
                      </a>{" "}
                      bize ulaşabilirsiniz.
                    </p>
                  </section>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

