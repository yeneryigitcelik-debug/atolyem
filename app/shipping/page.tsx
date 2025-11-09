import Link from "next/link";

export default function ShippingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-[#1F2937] mb-8">Kargo ve Teslimat</h1>
                
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-sm text-gray-500">Son Güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</p>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">1. Teslimat Süreleri</h2>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
                      <h3 className="font-semibold text-[#1F2937] mb-3">Hazırlık Süresi</h3>
                      <p className="mb-2">
                        El yapımı ürünler olduğu için, her ürünün hazırlık süresi farklıdır. 
                        Ürün sayfasında belirtilen hazırlık süresine dikkat edin.
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li><strong>Hazır ürünler:</strong> 1-3 iş günü</li>
                        <li><strong>Özel üretim:</strong> 7-21 iş günü (ürüne göre değişir)</li>
                        <li><strong>Kişiye özel:</strong> 14-30 iş günü</li>
                      </ul>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-[#1F2937] mb-3">Kargo Süresi</h3>
                      <p className="mb-2">Kargo süreleri teslimat adresine göre değişir:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li><strong>İstanbul, Ankara, İzmir:</strong> 1-2 iş günü</li>
                        <li><strong>Diğer şehirler:</strong> 2-4 iş günü</li>
                        <li><strong>İlçe ve köyler:</strong> 3-5 iş günü</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">2. Kargo Ücretleri</h2>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-blue-800">
                          <strong>Ücretsiz Kargo:</strong> Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir. 
                          Kampanya detayları ürün sayfalarında belirtilir.
                        </p>
                      </div>
                      <p className="mb-2">Kargo ücretleri:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Standart kargo: 25-50 TL (ağırlık ve boyuta göre)</li>
                        <li>Hızlı kargo: 50-100 TL (1 iş günü teslimat)</li>
                        <li>Kapıda ödeme: +10 TL ek ücret</li>
                        <li>Ücretsiz kargo kampanyası: Belirtilen tutarın üzerindeki siparişlerde</li>
                      </ul>
                      <p className="text-sm text-gray-600 mt-4">
                        Kargo ücreti, sepet sayfasında ve ödeme adımında gösterilir.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">3. Kargo Firmaları</h2>
                    <p className="mb-4">
                      Siparişleriniz güvenilir kargo firmaları aracılığıyla gönderilir:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-[#1F2937] mb-2">PTT Kargo</h3>
                        <p className="text-sm text-gray-600">
                          Türkiye'nin her yerine güvenli teslimat. Özellikle ilçe ve köylere ideal.
                        </p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-[#1F2937] mb-2">Yurtiçi Kargo</h3>
                        <p className="text-sm text-gray-600">
                          Hızlı ve güvenilir teslimat. Büyük şehirlerde 1-2 gün içinde teslimat.
                        </p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-[#1F2937] mb-2">Aras Kargo</h3>
                        <p className="text-sm text-gray-600">
                          Geniş şube ağı ile hızlı teslimat seçeneği.
                        </p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-[#1F2937] mb-2">MNG Kargo</h3>
                        <p className="text-sm text-gray-600">
                          Özellikle hassas ürünler için özenli paketleme ve teslimat.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">4. Sipariş Takibi</h2>
                    <p className="mb-4">
                      Siparişinizin durumunu takip etmek için:
                    </p>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <ol className="list-decimal list-inside space-y-3 ml-2">
                        <li>
                          <Link href="/orders" className="text-[#D97706] hover:underline font-medium">
                            Siparişlerim
                          </Link>{" "}
                          sayfasına gidin
                        </li>
                        <li>Takip etmek istediğiniz siparişi seçin</li>
                        <li>Kargo takip numarasını görüntüleyin</li>
                        <li>Kargo firmasının web sitesinden detaylı takip yapın</li>
                      </ol>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Kargo takip numarası, siparişiniz kargoya verildiğinde size SMS ve e-posta ile bildirilir.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">5. Teslimat Adresi</h2>
                    <p className="mb-2">Teslimat adresi bilgileri:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Doğru ve güncel adres bilgisi vermeniz önemlidir</li>
                      <li>Adres değişikliği, sipariş hazırlanmadan önce yapılabilir</li>
                      <li>Kargo firması, adres bulunamazsa size ulaşmaya çalışır</li>
                      <li>3 iş günü içinde teslim alınmayan paketler iade edilir</li>
                      <li>İş yeri adresleri için çalışma saatlerini belirtin</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">6. Kapıda Ödeme</h2>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
                      <p className="text-yellow-800">
                        <strong>Not:</strong> Kapıda ödeme seçeneği, bazı ürünlerde ve bölgelerde mevcut olmayabilir.
                      </p>
                    </div>
                    <p className="mb-2">Kapıda ödeme özellikleri:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Nakit veya kredi kartı ile ödeme yapabilirsiniz</li>
                      <li>+10 TL ek ücret alınır</li>
                      <li>Kargo görevlisi, ürünü kontrol etmenize izin verir</li>
                      <li>Ödeme yapmadan önce paketi açıp kontrol edebilirsiniz</li>
                      <li>Ürünü beğenmezseniz, ödeme yapmadan iade edebilirsiniz</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">7. Teslimat Sorunları</h2>
                    <p className="mb-4">Teslimat sırasında sorun yaşarsanız:</p>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-[#1F2937] mb-3">Yaygın Sorunlar ve Çözümler</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-[#1F2937] mb-1">Paket hasarlı geldi</h4>
                          <p className="text-sm text-gray-600">
                            Paketi açmadan kargo görevlisine iade edin veya fotoğraf çekip{" "}
                            <Link href="/contact" className="text-[#D97706] hover:underline">bizimle iletişime geçin</Link>.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1F2937] mb-1">Yanlış ürün geldi</h4>
                          <p className="text-sm text-gray-600">
                            Derhal{" "}
                            <Link href="/contact" className="text-[#D97706] hover:underline">bizimle iletişime geçin</Link>{" "}
                            ve ürünü kullanmadan iade edin.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1F2937] mb-1">Teslimat gecikti</h4>
                          <p className="text-sm text-gray-600">
                            Kargo takip numaranızla kargo firmasının web sitesinden durumu kontrol edin. 
                            Sorun devam ederse{" "}
                            <Link href="/contact" className="text-[#D97706] hover:underline">bizimle iletişime geçin</Link>.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1F2937] mb-1">Adres bulunamadı</h4>
                          <p className="text-sm text-gray-600">
                            Kargo firması size ulaşmaya çalışır. Telefonunuzu açık tutun ve 
                            adres bilgilerinizi güncelleyin.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">8. Uluslararası Teslimat</h2>
                    <p className="mb-4">
                      Şu anda sadece Türkiye içi teslimat yapılmaktadır. Uluslararası teslimat özelliği yakında eklenecektir.
                    </p>
                    <p className="text-sm text-gray-600">
                      Uluslararası teslimat hakkında bilgi almak için{" "}
                      <Link href="/contact" className="text-[#D97706] hover:underline">bizimle iletişime geçebilirsiniz</Link>.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">9. İletişim</h2>
                    <p>
                      Kargo ve teslimat konularında sorularınız için{" "}
                      <Link href="/contact" className="text-[#D97706] hover:underline">
                        iletişim sayfamızdan
                      </Link>{" "}
                      veya{" "}
                      <Link href="/help" className="text-[#D97706] hover:underline">
                        yardım merkezimizden
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

