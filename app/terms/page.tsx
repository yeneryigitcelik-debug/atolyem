import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-[#1F2937] mb-8">Kullanım Şartları ve Koşulları</h1>
                
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-sm text-gray-500">Son Güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</p>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">1. Genel Hükümler</h2>
                    <p className="mb-4">
                      Atölyem.net platformunu kullanarak, aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. 
                      Bu şartları kabul etmiyorsanız, lütfen platformu kullanmayın.
                    </p>
                    <p>
                      Platform, el yapımı sanat ürünlerinin satışı için bir pazaryeri hizmeti sunmaktadır. 
                      Platform üzerinden yapılan tüm işlemler bu şartlar ve koşullara tabidir.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">2. Hesap Oluşturma ve Güvenlik</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Hesap oluştururken doğru ve güncel bilgiler vermeniz gerekmektedir.</li>
                      <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz.</li>
                      <li>Şifrenizi kimseyle paylaşmamalı ve güvenli bir şifre seçmelisiniz.</li>
                      <li>Hesabınızın yetkisiz kullanımından şüphelenirseniz derhal bizimle iletişime geçin.</li>
                      <li>Platform, hesap güvenliğiniz için gerekli önlemleri alır ancak tam güvence veremez.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">3. Satıcı Sorumlulukları</h2>
                    <p className="mb-2">Satıcılar olarak:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Ürünlerinizin doğru ve eksiksiz bilgilerini sağlamalısınız.</li>
                      <li>Ürün görselleri gerçek ürünü yansıtmalıdır.</li>
                      <li>Stok durumunu güncel tutmalısınız.</li>
                      <li>Siparişleri belirtilen süre içinde hazırlamalı ve kargoya vermelisiniz.</li>
                      <li>Müşteri sorularına zamanında ve nazikçe yanıt vermelisiniz.</li>
                      <li>Telif hakkı ihlali yapmamalı, orijinal eserler satmalısınız.</li>
                      <li>Komisyon oranlarını ve ödeme koşullarını kabul etmiş sayılırsınız.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">4. Alıcı Sorumlulukları</h2>
                    <p className="mb-2">Alıcılar olarak:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Ürün bilgilerini dikkatlice okumalısınız.</li>
                      <li>Doğru teslimat adresi ve iletişim bilgileri sağlamalısınız.</li>
                      <li>Ödeme bilgilerinizi güvenli bir şekilde girmelisiniz.</li>
                      <li>Siparişinizi aldıktan sonra kontrol etmeli, sorun varsa 14 gün içinde bildirmelisiniz.</li>
                      <li>Ürünleri kullanmadan önce iade hakkınızı kaybedebilirsiniz.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">5. Ödeme ve Fiyatlandırma</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Tüm fiyatlar Türk Lirası (TL) cinsindendir ve KDV dahildir.</li>
                      <li>Platform, güvenli ödeme altyapıları kullanır.</li>
                      <li>Ödeme işlemi tamamlandıktan sonra sipariş işleme alınır.</li>
                      <li>Fiyat hataları durumunda platform, siparişi iptal etme hakkını saklı tutar.</li>
                      <li>Kargo ücretleri ürün sayfasında veya sepet sayfasında gösterilir.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">6. İade ve İptal</h2>
                    <p className="mb-2">İade ve iptal koşulları:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Ürünlerin iadesi için <Link href="/returns" className="text-[#D97706] hover:underline">İade Politikamız</Link> geçerlidir.</li>
                      <li>Hazırlanmamış siparişler iptal edilebilir.</li>
                      <li>Kargoya verilmiş siparişler iptal edilemez, ancak iade edilebilir.</li>
                      <li>İade işlemleri, ürünün orijinal durumunda olması şartıyla yapılır.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">7. Fikri Mülkiyet</h2>
                    <p className="mb-4">
                      Platform üzerindeki tüm içerikler (metin, görsel, logo, tasarım vb.) Atölyem.net'e aittir 
                      veya kullanım hakkına sahiptir. Bu içerikler izinsiz kopyalanamaz, dağıtılamaz veya kullanılamaz.
                    </p>
                    <p>
                      Satıcılar, yükledikleri ürün görselleri ve açıklamalarının kendilerine ait olduğunu veya 
                      kullanım hakkına sahip olduklarını beyan ederler.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">8. Platform Kullanımı</h2>
                    <p className="mb-2">Platformu kullanırken yasak olan davranışlar:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Yanıltıcı veya yanlış bilgi vermek</li>
                      <li>Spam, phishing veya zararlı içerik paylaşmak</li>
                      <li>Başkalarının hesaplarını kullanmaya çalışmak</li>
                      <li>Platformun güvenliğini tehdit eden eylemlerde bulunmak</li>
                      <li>Telif hakkı ihlali yapmak</li>
                      <li>Rekabetçi olmayan davranışlarda bulunmak</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">9. Sorumluluk Sınırlaması</h2>
                    <p className="mb-4">
                      Atölyem.net, bir pazaryeri platformu olarak satıcı ve alıcı arasında aracılık yapar. 
                      Ürün kalitesi, teslimat ve ödeme konularında doğrudan sorumluluk almaz. 
                      Satıcı ve alıcı arasındaki anlaşmazlıklar, mümkün olduğunca platform aracılığıyla çözülmeye çalışılır.
                    </p>
                    <p>
                      Platform, teknik hatalar, kesintiler veya güvenlik sorunlarından kaynaklanan zararlardan 
                      sorumlu tutulamaz.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">10. Değişiklikler ve Güncellemeler</h2>
                    <p>
                      Bu kullanım şartları, platform tarafından önceden haber verilmeksizin değiştirilebilir. 
                      Değişiklikler yürürlüğe girdiğinde, platformu kullanmaya devam etmeniz yeni şartları 
                      kabul ettiğiniz anlamına gelir.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">11. İletişim</h2>
                    <p>
                      Bu şartlar ve koşullar hakkında sorularınız için{" "}
                      <Link href="/contact" className="text-[#D97706] hover:underline">
                        iletişim sayfamızdan
                      </Link>{" "}
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

