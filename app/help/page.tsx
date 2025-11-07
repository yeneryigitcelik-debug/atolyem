import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import Link from "next/link";

export default async function HelpPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  const faqCategories = [
    {
      title: "Hesap ve Giriş",
      items: [
        { question: "Hesabımı nasıl oluşturabilirim?", answer: "Ana sayfadaki 'Kayıt Ol' butonuna tıklayarak yeni bir hesap oluşturabilirsiniz." },
        { question: "Şifremi unuttum, ne yapmalıyım?", answer: "Giriş sayfasındaki 'Şifremi Unuttum' linkini kullanarak şifrenizi sıfırlayabilirsiniz." },
        { question: "Hesabımı nasıl silerim?", answer: "Hesap ayarları sayfasından hesabınızı silebilirsiniz." },
      ],
    },
    {
      title: "Siparişler",
      items: [
        { question: "Siparişimi nasıl takip edebilirim?", answer: "Siparişlerim sayfasından tüm siparişlerinizi görüntüleyebilir ve durumlarını takip edebilirsiniz." },
        { question: "Siparişimi iptal edebilir miyim?", answer: "Sipariş durumuna göre iptal edebilirsiniz. Henüz hazırlanmamış siparişler iptal edilebilir." },
        { question: "Kargo takip numarasını nerede bulabilirim?", answer: "Siparişiniz kargoya verildiğinde, sipariş detay sayfasında kargo takip numarasını görebilirsiniz." },
      ],
    },
    {
      title: "Ödeme",
      items: [
        { question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?", answer: "Şu anda kredi kartı ve banka kartı ile ödeme yapabilirsiniz. Daha fazla ödeme yöntemi yakında eklenecek." },
        { question: "Ödeme güvenli mi?", answer: "Evet, tüm ödemeler SSL şifreleme ile korunmaktadır ve güvenli ödeme altyapıları kullanılmaktadır." },
        { question: "İade işlemi nasıl yapılır?", answer: "Siparişlerim sayfasından iade talebi oluşturabilirsiniz. İade koşulları ürün sayfasında belirtilmiştir." },
      ],
    },
    {
      title: "Satıcı Olmak",
      items: [
        { question: "Nasıl satıcı olabilirim?", answer: "Header'daki 'Atölyeni Oluştur' butonuna tıklayarak satıcı hesabı oluşturabilirsiniz." },
        { question: "Komisyon oranı nedir?", answer: "Varsayılan komisyon oranı %15'tir. Detaylı bilgi için satıcı sözleşmesini inceleyebilirsiniz." },
        { question: "Ödemeleri ne zaman alırım?", answer: "Siparişler tamamlandıktan sonra ödemeler hesabınıza aktarılır." },
      ],
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF8F1" }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <Header />

            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[#1F2937] mb-8">Yardım Merkezi</h1>

                {/* Arama */}
                <div className="mb-8">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Sorunuzu arayın..."
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                    />
                  </div>
                </div>

                {/* Hızlı Bağlantılar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Link
                    href="/orders"
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="material-symbols-outlined text-3xl text-[#D97706] mb-2">receipt_long</span>
                    <h3 className="font-semibold text-[#1F2937]">Siparişlerim</h3>
                    <p className="text-sm text-gray-600 mt-1">Siparişlerinizi görüntüleyin</p>
                  </Link>
                  <Link
                    href="/messages"
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="material-symbols-outlined text-3xl text-[#D97706] mb-2">chat_bubble_outline</span>
                    <h3 className="font-semibold text-[#1F2937]">Mesajlar</h3>
                    <p className="text-sm text-gray-600 mt-1">Satıcılarla iletişime geçin</p>
                  </Link>
                  <Link
                    href="/settings"
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="material-symbols-outlined text-3xl text-[#D97706] mb-2">settings</span>
                    <h3 className="font-semibold text-[#1F2937]">Ayarlar</h3>
                    <p className="text-sm text-gray-600 mt-1">Hesap ayarlarınızı yönetin</p>
                  </Link>
                </div>

                {/* SSS */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-[#1F2937]">Sık Sorulan Sorular</h2>
                  {faqCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="text-xl font-semibold text-[#1F2937] mb-4">{category.title}</h3>
                      <div className="space-y-4">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                            <h4 className="font-medium text-[#1F2937] mb-2">{item.question}</h4>
                            <p className="text-sm text-gray-600">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* İletişim */}
                <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-[#1F2937] mb-4">Hala yardıma mı ihtiyacınız var?</h3>
                  <p className="text-gray-600 mb-4">
                    Sorularınız için bizimle iletişime geçebilirsiniz. Destek ekibimiz size yardımcı olmaktan mutluluk duyar.
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="mailto:destek@atolyem.net"
                      className="px-4 py-2 rounded-lg bg-[#D97706] text-white hover:bg-[#92400E] transition-colors font-medium"
                    >
                      E-posta Gönder
                    </a>
                    <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      Canlı Destek
                    </button>
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

