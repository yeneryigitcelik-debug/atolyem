import Header from "@/app/components/Header";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <Header />

            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-[#1F2937] mb-8">Hikayemiz</h1>
                
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg">
                    Atölyem.net, Türkiye'nin dört bir yanındaki yetenekli zanaatkarların ve sanatçıların el yapımı eserlerini 
                    dünyayla buluşturan bir platformdur. 2024 yılında kurulan Atölyem, geleneksel Türk sanatını modern 
                    teknolojiyle birleştirerek, sanatçıların eserlerini daha geniş kitlelere ulaştırmayı hedefler.
                  </p>

                  <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">Misyonumuz</h2>
                  <p>
                    Amacımız, bağımsız sanatçıların ve zanaatkarların tutkularını sürdürülebilir bir işe dönüştürmelerine 
                    yardımcı olmak. Her alışveriş, yerel ekonomiyi ve yaratıcılığı destekler. Biz, sanatçıların eserlerini 
                    değerli buldukları fiyatlardan satabilmelerini ve müşterilerin özgün, el yapımı ürünlere kolayca 
                    erişebilmelerini sağlıyoruz.
                  </p>

                  <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">Vizyonumuz</h2>
                  <p>
                    Türkiye'nin en büyük el yapımı ürün pazarı olmak ve dünya çapında Türk sanatını tanıtmak. 
                    Her satıcının başarılı olmasını, her müşterinin hayalindeki ürünü bulmasını sağlamak.
                  </p>

                  <h2 className="text-2xl font-bold text-[#1F2937] mt-8 mb-4">Değerlerimiz</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Özgünlük:</strong> Her eser, sanatçının kendi yaratıcılığının bir yansımasıdır.</li>
                    <li><strong>Kalite:</strong> El yapımı ürünlerde en yüksek standartları koruyoruz.</li>
                    <li><strong>Topluluk:</strong> Sanatçılar ve müşteriler arasında güçlü bir topluluk oluşturuyoruz.</li>
                    <li><strong>Şeffaflık:</strong> Tüm işlemlerimizde açık ve dürüst olmayı hedefliyoruz.</li>
                    <li><strong>Sürdürülebilirlik:</strong> Yerel üretimi ve çevre dostu uygulamaları destekliyoruz.</li>
                  </ul>

                  <div className="mt-12 p-6 bg-[#D97706]/10 rounded-lg">
                    <h3 className="text-xl font-bold text-[#1F2937] mb-4">Bize Katılın</h3>
                    <p className="mb-4">
                      Sanatçı olarak platformumuza katılmak veya daha fazla bilgi almak için bizimle iletişime geçin.
                    </p>
                    <div className="flex gap-4">
                      <Link
                        href="/contact"
                        className="inline-block rounded-md bg-[#D97706] px-6 py-2 text-white hover:bg-[#92400E] transition-colors font-medium"
                      >
                        İletişime Geç
                      </Link>
                      <Link
                        href="/seller"
                        className="inline-block rounded-md border border-[#D97706] px-6 py-2 text-[#D97706] hover:bg-[#D97706]/10 transition-colors font-medium"
                      >
                        Satıcı Ol
                      </Link>
                    </div>
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

