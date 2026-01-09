import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";

const categories = [
  { title: "Ev Hediyeleri", icon: "home", desc: "Ev dekorasyonuna özel parçalar" },
  { title: "Kişiye Özel", icon: "person", desc: "Kişiselleştirilebilir eserler" },
  { title: "500 TL Altı", icon: "savings", desc: "Bütçe dostu seçenekler" },
  { title: "Lüks Hediyeler", icon: "diamond", desc: "Özel günler için" },
];

const giftIdeas = [
  { title: "Seramik Vazo Seti", artist: "Toprak Atölyesi", price: 850, slug: "seramik-vazo-seti", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop", badge: "Popüler" },
  { title: "El Yapımı Mumluk", artist: "Cam Ustası", price: 320, slug: "el-yapimi-mumluk", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=400&fit=crop", badge: "500 TL Altı" },
  { title: "Minimalist Tablo", artist: "Selin Koç", price: 1200, slug: "minimalist-tablo", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", badge: "Ev Hediyesi" },
  { title: "Kişiye Özel Portre", artist: "Ayşe Demir", price: 2500, slug: "kisiye-ozel-portre", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop", badge: "Kişiselleştir" },
];

export default function HediyeRehberiPage() {
  return (
    <>
      <PageHeader 
        title="Hediye Rehberi" 
        description="Sevdikleriniz için benzersiz hediye fikirleri."
        badge="Özel Günler İçin"
      />

      {/* Categories */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold text-text-charcoal mb-6">Kategoriye Göre</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Link key={i} href="#" className="group bg-surface-white rounded-lg border border-border-subtle p-6 text-center hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-primary text-3xl mb-3">{cat.icon}</span>
              <h3 className="font-semibold text-text-charcoal group-hover:text-primary transition-colors">{cat.title}</h3>
              <p className="text-sm text-text-secondary mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Gift Ideas */}
      <section className="bg-surface-warm border-y border-border-subtle py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-text-charcoal mb-8">Öne Çıkan Hediye Fikirleri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {giftIdeas.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold text-text-charcoal mb-8">Hediye Seçim İpuçları</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <span className="material-symbols-outlined text-primary text-2xl mb-4">lightbulb</span>
            <h3 className="font-semibold text-text-charcoal mb-2">İlgi Alanlarını Düşünün</h3>
            <p className="text-text-secondary text-sm">Sevdiğiniz kişinin hobilerini ve ev dekorasyonunu göz önünde bulundurun.</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <span className="material-symbols-outlined text-primary text-2xl mb-4">palette</span>
            <h3 className="font-semibold text-text-charcoal mb-2">Renk Uyumuna Dikkat</h3>
            <p className="text-text-secondary text-sm">Hediye edeceğiniz kişinin evindeki renk paletini düşünün.</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <span className="material-symbols-outlined text-primary text-2xl mb-4">edit</span>
            <h3 className="font-semibold text-text-charcoal mb-2">Kişiselleştirin</h3>
            <p className="text-text-secondary text-sm">Özel bir not veya kişiselleştirme seçeneği ile hediyenizi daha anlamlı kılın.</p>
          </div>
        </div>
      </section>
    </>
  );
}





