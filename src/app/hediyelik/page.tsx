import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

const giftCategories = [
  { name: "Sevgiliye", icon: "favorite", slug: "sevgiliye" },
  { name: "Anneler Günü", icon: "family_restroom", slug: "anneler-gunu" },
  { name: "Doğum Günü", icon: "cake", slug: "dogum-gunu" },
  { name: "Yeni Ev", icon: "home", slug: "yeni-ev" },
  { name: "Kurumsal", icon: "business", slug: "kurumsal" },
  { name: "Çocuklara", icon: "child_care", slug: "cocuklara" },
];

export default function HediyelikPage() {
  return (
    <>
      <PageHeader
        title="Hediyelik"
        description="Sevdiklerinize özel, el yapımı ve benzersiz hediyeler."
        badge="Hediye Rehberi"
      />

      {/* Gift Categories */}
      <section className="bg-surface-white border-b border-border-subtle py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {giftCategories.map((cat) => (
              <div
                key={cat.slug}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-background-ivory transition-colors group min-w-[100px] opacity-60 cursor-not-allowed"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">{cat.icon}</span>
                </div>
                <span className="text-sm font-medium text-text-charcoal whitespace-nowrap">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20 bg-surface-white rounded-lg border border-border-subtle">
          <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">card_giftcard</span>
          <h3 className="text-xl font-semibold text-text-charcoal mb-2">Hediye Önerileri Hazırlanıyor</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Özel hediye setleri ve önerilerimiz yakında burada olacak. Şimdilik tüm eserleri keşfedebilirsiniz!
          </p>
          <Link 
            href="/kesfet" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors"
          >
            Eserleri Keşfet
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Gift Card Section */}
      <section className="bg-primary py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-4">Atölyem Hediye Kartı</h2>
              <p className="text-white/80 max-w-xl">
                Ne alacağınızdan emin değil misiniz? Hediye kartı ile sevdikleriniz kendi seçimini yapsın. 
                100 ₺ ile 5.000 ₺ arası tutarlarda hediye kartı yükleyebilirsiniz.
              </p>
            </div>
            <span className="px-8 py-4 bg-white/50 text-white font-semibold rounded-lg flex items-center gap-2 cursor-not-allowed">
              <span className="material-symbols-outlined">card_giftcard</span>
              Yakında
            </span>
          </div>
        </div>
      </section>

      {/* Personalization Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-surface-warm rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
                <span className="material-symbols-outlined text-[14px] mr-1">auto_fix_high</span>
                Kişiselleştirme
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-text-charcoal mb-4">
                Hediyenizi Özelleştirin
              </h2>
              <p className="text-text-secondary mb-6">
                Birçok sanatçımız eserlerini kişiselleştirme imkanı sunuyor. İsim, tarih veya özel mesaj 
                ekleyerek hediyenizi daha da anlamlı hale getirin.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-text-charcoal">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[18px]">edit</span>
                  </span>
                  İsim veya mesaj ekleme
                </li>
                <li className="flex items-center gap-3 text-text-charcoal">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[18px]">palette</span>
                  </span>
                  Renk tercihi
                </li>
                <li className="flex items-center gap-3 text-text-charcoal">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[18px]">straighten</span>
                  </span>
                  Boyut seçenekleri
                </li>
              </ul>
              <Link
                href="/kesfet"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
              >
                Eserleri Keşfet
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-8xl text-primary/30">auto_fix_high</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
