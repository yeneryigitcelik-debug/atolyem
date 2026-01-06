import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";

const giftCategories = [
  { name: "Sevgiliye", icon: "favorite", slug: "sevgiliye" },
  { name: "Anneler Günü", icon: "family_restroom", slug: "anneler-gunu" },
  { name: "Doğum Günü", icon: "cake", slug: "dogum-gunu" },
  { name: "Yeni Ev", icon: "home", slug: "yeni-ev" },
  { name: "Kurumsal", icon: "business", slug: "kurumsal" },
  { name: "Çocuklara", icon: "child_care", slug: "cocuklara" },
];

const giftIdeas = [
  {
    title: "El Yapımı Seramik Vazo",
    artist: "Mehmet Demir",
    price: 850,
    slug: "el-yapimi-seramik-vazo",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
    badge: "Kişiselleştirilebilir",
  },
  {
    title: "Soyut Tablo 'Umut'",
    artist: "Zeynep Kaya",
    price: 2800,
    slug: "soyut-tablo-umut",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop",
    badge: "Orijinal",
  },
  {
    title: "El Örgüsü Şal",
    artist: "Fatma Çelik",
    price: 450,
    slug: "el-orgusu-sal",
    image: "https://images.unsplash.com/photo-1509028313376-ec8e0f233f54?w=400&h=400&fit=crop",
    badge: "El İşi",
  },
  {
    title: "Cam Takı Seti",
    artist: "Emre Arslan",
    price: 680,
    slug: "cam-taki-seti",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    badge: "Limited",
  },
  {
    title: "Manzara Fotoğrafı",
    artist: "Ali Öztürk",
    price: 320,
    slug: "manzara-fotografi",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    badge: "Baskı",
  },
  {
    title: "Bronz Biblo",
    artist: "Ayşe Yılmaz",
    price: 1200,
    slug: "bronz-biblo",
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=400&h=400&fit=crop",
    badge: "Orijinal",
  },
  {
    title: "Kişiselleştirilmiş Portre",
    artist: "Zeynep Kaya",
    price: 1500,
    slug: "kisisellestirilmis-portre",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop",
    badge: "Sipariş Üzerine",
  },
  {
    title: "Ahşap Oyma Kutu",
    artist: "Mehmet Demir",
    price: 380,
    slug: "ahsap-oyma-kutu",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    badge: "El İşi",
  },
];

const giftSets = [
  {
    title: "Romantik Hediye Paketi",
    description: "Sevdikleriniz için özel seçilmiş sanat eserleri",
    price: 1250,
    originalPrice: 1600,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&h=300&fit=crop",
    items: ["El yapımı vazo", "Mum seti", "Hediye kartı"],
  },
  {
    title: "Ev Dekorasyon Seti",
    description: "Yeni evlere şık bir başlangıç",
    price: 2800,
    originalPrice: 3500,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=500&h=300&fit=crop",
    items: ["2 adet tablo", "Dekoratif vazo", "Mumluk"],
  },
  {
    title: "Kurumsal Hediye Seti",
    description: "İş ortaklarınız için özel",
    price: 980,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop",
    items: ["Masa aksesuarı", "Kalemlik", "Not defteri"],
  },
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
              <Link
                key={cat.slug}
                href={`/hediyelik/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-background-ivory transition-colors group min-w-[100px]"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary text-2xl">{cat.icon}</span>
                </div>
                <span className="text-sm font-medium text-text-charcoal whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Sets */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-charcoal">Özel Hediye Setleri</h2>
            <p className="text-text-secondary">Özenle seçilmiş kombinasyonlar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {giftSets.map((set, i) => (
            <div
              key={i}
              className="bg-surface-white rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative aspect-[5/3] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('${set.image}')` }}
                />
                {set.originalPrice && (
                  <span className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-bold bg-red-500 text-white">
                    %{Math.round((1 - set.price / set.originalPrice) * 100)} İndirim
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-text-charcoal text-lg mb-1">{set.title}</h3>
                <p className="text-sm text-text-secondary mb-4">{set.description}</p>
                <ul className="text-sm text-text-secondary space-y-1 mb-4">
                  {set.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                  <div>
                    <span className="text-xl font-bold text-text-charcoal">{set.price.toLocaleString("tr-TR")} ₺</span>
                    {set.originalPrice && (
                      <span className="text-sm text-text-secondary line-through ml-2">
                        {set.originalPrice.toLocaleString("tr-TR")} ₺
                      </span>
                    )}
                  </div>
                  <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors">
                    Sepete Ekle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gift Ideas */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-charcoal">Hediye Önerileri</h2>
            <p className="text-text-secondary">El yapımı, özgün ve anlamlı hediyeler</p>
          </div>
          <Link href="/kesfet" className="text-primary hover:text-primary-dark font-medium flex items-center gap-1">
            Tümünü Gör
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {giftIdeas.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
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
            <Link
              href="/hediye-karti"
              className="px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-background-ivory transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">card_giftcard</span>
              Hediye Kartı Al
            </Link>
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
                href="/kesfet?filter=kisisellestirilabilir"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
              >
                Kişiselleştirilebilir Ürünler
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600&h=600&fit=crop')",
                    }}
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-surface-white rounded-xl p-4 shadow-lg border border-border-subtle">
                  <p className="text-sm font-medium text-text-charcoal">&quot;Ayşe&apos;ye Sevgilerle&quot;</p>
                  <p className="text-xs text-text-secondary">Kişiselleştirilmiş mesaj</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

