import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

const categories = [
  { title: "Sipariş ve Teslimat", icon: "local_shipping", items: ["Siparişimi nasıl takip ederim?", "Teslimat süreleri ne kadar?", "Kargo ücreti nasıl hesaplanır?"] },
  { title: "İade ve İptal", icon: "replay", items: ["İade koşulları nelerdir?", "Siparişimi nasıl iptal ederim?", "Para iadesi ne zaman yapılır?"] },
  { title: "Ödeme", icon: "credit_card", items: ["Hangi ödeme yöntemlerini kabul ediyorsunuz?", "Taksit seçenekleri var mı?", "Ödeme güvenli mi?"] },
  { title: "Hesap", icon: "person", items: ["Şifremi nasıl değiştiririm?", "Hesabımı nasıl silerim?", "E-posta tercihlerimi nasıl güncellerim?"] },
];

const faqs = [
  { q: "Ürünler orijinal mi?", a: "Evet, platformumuzdaki tüm ürünler doğrulanmış sanatçılar tarafından üretilen orijinal eserlerdir. Her eser orijinallik sertifikası ile gönderilir." },
  { q: "Kargo ücretsiz mi?", a: "500 TL ve üzeri siparişlerde Türkiye geneli kargo ücretsizdir. Altındaki siparişler için kargo ücreti ödeme sayfasında görüntülenir." },
  { q: "İade yapabilir miyim?", a: "Evet, 14 gün içinde iade yapabilirsiniz. Ürün hasarsız ve orijinal ambalajında olmalıdır. Özel sipariş ürünler iade kapsamı dışındadır." },
  { q: "Sanatçı olarak nasıl satış yaparım?", a: "Sanatçı Ol sayfamızdan başvuru yapabilirsiniz. Başvurunuz editör ekibimiz tarafından incelendikten sonra satışa başlayabilirsiniz." },
];

export default function YardimPage() {
  return (
    <>
      <PageHeader title="Yardım Merkezi" description="Aradığınız cevabı bulamadıysanız bize ulaşın." />

      {/* Search */}
      <div className="max-w-[600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary">search</span>
          <input
            type="text"
            placeholder="Nasıl yardımcı olabiliriz?"
            className="w-full pl-12 pr-4 py-4 border border-border-subtle rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-lg"
          />
        </div>
      </div>

      {/* Categories */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="bg-surface-white rounded-lg border border-border-subtle p-6">
              <span className="material-symbols-outlined text-primary text-3xl mb-4">{cat.icon}</span>
              <h3 className="font-bold text-text-charcoal mb-4">{cat.title}</h3>
              <ul className="space-y-2">
                {cat.items.map((item, j) => (
                  <li key={j}>
                    <a href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-surface-warm border-y border-border-subtle py-12">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-charcoal mb-8 text-center">Sıkça Sorulan Sorular</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-surface-white rounded-lg border border-border-subtle group">
                <summary className="p-6 cursor-pointer font-semibold text-text-charcoal flex items-center justify-between">
                  {faq.q}
                  <span className="material-symbols-outlined text-text-secondary group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-text-secondary">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-text-charcoal mb-4">Hala yardıma mı ihtiyacınız var?</h2>
        <p className="text-text-secondary mb-8">Müşteri destek ekibimiz size yardımcı olmak için hazır.</p>
        <Link href="/iletisim" className="inline-flex px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors">
          Bize Ulaşın
        </Link>
      </section>
    </>
  );
}

