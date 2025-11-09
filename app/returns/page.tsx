import Link from "next/link";

export default function ReturnsPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-[#1F2937] mb-8">İade ve Değişim Politikası</h1>
                
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-sm text-gray-500">Son Güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</p>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                    <p className="text-blue-800">
                      <strong>Önemli:</strong> Tüketicilerin Korunması Hakkında Kanun kapsamında, 
                      uzaktan satış sözleşmelerinde 14 gün içinde cayma hakkınız bulunmaktadır.
                    </p>
                  </div>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">1. İade Hakkı</h2>
                    <p className="mb-4">
                      Satın aldığınız ürünleri, teslim tarihinden itibaren <strong>14 gün içinde</strong> 
                      herhangi bir gerekçe göstermeksizin iade edebilirsiniz.
                    </p>
                    <p>
                      İade hakkınızı kullanmak için ürünün orijinal ambalajında, kullanılmamış, 
                      hasar görmemiş ve tüm aksesuarlarıyla birlikte olması gerekmektedir.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">2. İade Edilemeyen Ürünler</h2>
                    <p className="mb-2">Aşağıdaki durumlarda iade kabul edilmez:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Kişiye özel üretilen veya özelleştirilmiş ürünler</li>
                      <li>Hijyenik nedenlerle iade edilemeyecek ürünler (ör. takı, iç çamaşırı)</li>
                      <li>Ürünün ambalajı açılmış ve kullanılmış olması (deneme amaçlı kullanım hariç)</li>
                      <li>Ürünün orijinal halini kaybetmiş olması</li>
                      <li>Ürünün hasarlı veya eksik parçalarla iade edilmesi</li>
                      <li>14 günlük sürenin dolması</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">3. İade İşlemi Nasıl Yapılır?</h2>
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-[#1F2937] mb-2">Adım 1: İade Talebi Oluşturun</h3>
                        <p className="text-sm text-gray-600">
                          <Link href="/orders" className="text-[#D97706] hover:underline">Siparişlerim</Link> sayfasından 
                          iade etmek istediğiniz ürünü seçin ve "İade Talebi Oluştur" butonuna tıklayın.
                        </p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-[#1F2937] mb-2">Adım 2: İade Nedenini Belirtin</h3>
                        <p className="text-sm text-gray-600">
                          İade nedeninizi seçin ve gerekirse açıklama ekleyin. Bu bilgiler satıcıya iletilecektir.
                        </p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-[#1F2937] mb-2">Adım 3: Ürünü Paketleyin</h3>
                        <p className="text-sm text-gray-600">
                          Ürünü orijinal ambalajında, tüm aksesuarları ve belgeleriyle birlikte paketleyin.
                        </p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-[#1F2937] mb-2">Adım 4: Kargoya Verin</h3>
                        <p className="text-sm text-gray-600">
                          Size gönderilecek kargo etiketini kullanarak ürünü kargoya verin. 
                          Kargo ücreti, ürün hatası veya yanlış ürün gönderilmesi durumunda bizim tarafımızdan karşılanır.
                        </p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-[#1F2937] mb-2">Adım 5: İade Onayı ve Ödeme</h3>
                        <p className="text-sm text-gray-600">
                          Ürün kontrol edildikten sonra, iade onaylanır ve ödemeniz 3-5 iş günü içinde 
                          hesabınıza iade edilir.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">4. İade Kargo Ücreti</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Ürün hatası veya yanlış ürün:</strong> Kargo ücreti platform tarafından karşılanır.
                      </li>
                      <li>
                        <strong>Müşteri kaynaklı iade:</strong> Kargo ücreti müşteri tarafından karşılanır.
                      </li>
                      <li>
                        <strong>Ücretsiz kargo kampanyası:</strong> İade durumunda, kampanya kargo ücreti iade edilmez.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">5. İade Ödeme Süresi</h2>
                    <p className="mb-4">
                      İade edilen ürünün kontrolü tamamlandıktan sonra, ödemeniz <strong>3-5 iş günü</strong> içinde 
                      aynı ödeme yöntemiyle iade edilir.
                    </p>
                    <p>
                      Kredi kartı ile yapılan ödemeler, bankanızın işlem süresine bağlı olarak 5-10 iş günü sürebilir.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">6. Değişim</h2>
                    <p className="mb-4">
                      Ürün değişimi için önce iade işlemi yapılır, ardından istediğiniz ürünü tekrar satın alabilirsiniz. 
                      Fiyat farkı varsa, ek ödeme veya iade yapılır.
                    </p>
                    <p>
                      Aynı ürünün farklı varyantları (renk, beden vb.) için doğrudan değişim talebi oluşturabilirsiniz.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">7. Arızalı veya Hatalı Ürün</h2>
                    <p className="mb-4">
                      Ürününüz arızalı veya hatalı gelirse, derhal{" "}
                      <Link href="/contact" className="text-[#D97706] hover:underline">bizimle iletişime geçin</Link>. 
                      Bu durumda:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Kargo ücreti bizim tarafımızdan karşılanır</li>
                      <li>Ürün değişimi veya tam iade yapılır</li>
                      <li>Gerekirse onarım hizmeti sağlanır</li>
                      <li>Garanti kapsamındaki ürünler için garanti işlemleri başlatılır</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">8. İletişim</h2>
                    <p>
                      İade ve değişim konularında sorularınız için{" "}
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

