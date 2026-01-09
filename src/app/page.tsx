import Link from "next/link";
import HeroCarousel from "@/components/ui/HeroCarousel";
import ProductCard from "@/components/ui/ProductCard";
import { getNewListings, getPopularListings } from "@/lib/data/listings";

// Force dynamic rendering to always show fresh data
export const dynamic = "force-dynamic";

// Categories - core site functionality, kept as curated navigation
const categories = [
  { name: "Tablolar", slug: "tablolar", icon: "brush" },
  { name: "Seramik", slug: "seramik", icon: "water_drop" },
  { name: "Heykel", slug: "heykel", icon: "view_in_ar" },
  { name: "Fotoğraf", slug: "fotograf", icon: "photo_camera" },
  { name: "Tekstil", slug: "tekstil", icon: "checkroom" },
  { name: "Cam", slug: "cam", icon: "wine_bar" },
];

export default async function Home() {
  // Fetch data in parallel
  const [newListings, popularListings] = await Promise.all([
    getNewListings(8),
    getPopularListings(8),
  ]);

  return (
    <>
      {/* Hero Carousel Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <HeroCarousel />
      </section>

      {/* Quick Discovery Categories */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategori/${category.slug}`}
              className="group flex flex-col items-center gap-3 p-4 bg-surface-white rounded-md border border-border-subtle hover:border-primary transition-all duration-300 hover:shadow-md cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                  {category.icon}
                </span>
              </div>
              <span className="text-sm font-medium text-text-charcoal group-hover:text-primary transition-colors">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Collections - Coming Soon State */}
      <section className="bg-surface-warm py-16 border-y border-border-subtle/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-text-charcoal text-2xl font-bold tracking-tight">Editör Seçkileri</h3>
              <p className="text-text-secondary mt-1">Küratörlük ekibimiz tarafından özenle seçilmiş koleksiyonlar.</p>
            </div>
            <Link href="/koleksiyonlar" className="hidden sm:flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors group">
              Tüm Koleksiyonlar
              <span className="material-symbols-outlined ml-1 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="text-center py-16 bg-surface-white rounded-lg border border-border-subtle">
            <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">collections</span>
            <h3 className="text-xl font-semibold text-text-charcoal mb-2">Koleksiyonlar Hazırlanıyor</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">Küratörlerimiz sizin için özel koleksiyonlar oluşturuyor. Yakında burada!</p>
            <Link href="/kesfet" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors">
              Eserleri Keşfet
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals - Product Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <h3 className="text-text-charcoal text-2xl font-bold tracking-tight">Yeni Eklenenler</h3>
          <Link href="/yeni-gelenler" className="hidden sm:flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors group">
            Tümünü Gör
            <span className="material-symbols-outlined ml-1 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
        
        {newListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newListings.map((listing) => (
              <ProductCard
                key={listing.id}
                title={listing.title}
                artist={listing.artistName}
                artistSlug={listing.artistSlug ?? undefined}
                price={listing.price}
                slug={listing.slug}
                image={listing.thumbnail || "/images/placeholder-art.jpg"}
                listingId={listing.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-white rounded-lg border border-border-subtle">
            <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">palette</span>
            <h3 className="text-xl font-semibold text-text-charcoal mb-2">Henüz yeni eser eklenmedi</h3>
            <p className="text-text-secondary mb-6">Yakında harika eserler burada görünecek.</p>
            <Link href="/sanatci-ol" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors">
              Sanatçı Olarak Katıl
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </section>

      {/* Trust / Quality Strip */}
      <section className="border-y border-border-subtle bg-surface-warm/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h3 className="sr-only">Neden Atölyem?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-text-charcoal mt-1">verified_user</span>
              <div>
                <h4 className="text-text-charcoal font-semibold mb-1">Küratöryel Seçki</h4>
                <p className="text-sm text-text-secondary leading-relaxed">Uzman editörlerimiz tarafından titizlikle seçilen özgün eserler.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-text-charcoal mt-1">lock</span>
              <div>
                <h4 className="text-text-charcoal font-semibold mb-1">Güvenli Ödeme</h4>
                <p className="text-sm text-text-secondary leading-relaxed">256-bit SSL şifreleme ile korunan güvenli ödeme altyapısı.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-text-charcoal mt-1">local_shipping</span>
              <div>
                <h4 className="text-text-charcoal font-semibold mb-1">Şeffaf Kargo</h4>
                <p className="text-sm text-text-secondary leading-relaxed">Eseriniz size ulaşana kadar adım adım takip ve sigorta.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-text-charcoal mt-1">person_check</span>
              <div>
                <h4 className="text-text-charcoal font-semibold mb-1">Doğrulanmış Satıcı</h4>
                <p className="text-sm text-text-secondary leading-relaxed">Tüm sanatçılarımız kimlik ve portfolyo kontrolünden geçer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Spotlight - Coming Soon */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Placeholder Art Pattern */}
            <div className="w-full lg:w-1/2 min-h-[400px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-8xl text-primary/30 mb-4">person_celebrate</span>
              </div>
            </div>
            {/* Content */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <span className="text-primary font-semibold tracking-wide text-sm uppercase mb-2">Ayın Sanatçısı</span>
              <h3 className="text-3xl font-bold text-text-charcoal mb-4">Çok Yakında</h3>
              <p className="text-text-secondary text-lg leading-relaxed mb-8">
                Yetenekli sanatçılarımızı burada tanıtacağız. İlham verici hikayeler ve benzersiz eserlerle tanışmak için bizi takip etmeye devam edin.
              </p>
              <Link href="/kesfet" className="self-start px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors shadow-sm">
                Eserleri Keşfet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular / Trending Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-text-charcoal text-2xl font-bold tracking-tight">Şu An Popüler</h3>
        </div>
        {/* Category Chips */}
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2">
          <button className="whitespace-nowrap px-4 py-2 bg-primary text-white text-sm font-medium rounded-full shadow-sm">Tümü</button>
          <Link href="/kategori/tablolar" className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Soyut Resim</Link>
          <Link href="/kategori/seramik" className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">El Yapımı Seramik</Link>
          <Link href="/kategori/tekstil" className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Duvar Dekoru</Link>
          <Link href="/kategori/heykel" className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Modern Heykel</Link>
        </div>
        
        {popularListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {popularListings.map((listing) => (
              <ProductCard
                key={listing.id}
                title={listing.title}
                artist={listing.artistName}
                artistSlug={listing.artistSlug ?? undefined}
                price={listing.price}
                slug={listing.slug}
                image={listing.thumbnail || "/images/placeholder-art.jpg"}
                listingId={listing.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-white rounded-lg border border-border-subtle">
            <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">trending_up</span>
            <h3 className="text-xl font-semibold text-text-charcoal mb-2">Henüz popüler eser yok</h3>
            <p className="text-text-secondary mb-6">En çok beğenilen eserler burada görünecek.</p>
            <Link href="/kesfet" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors">
              Keşfetmeye Başla
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </section>

      {/* Blog Teaser */}
      <section className="bg-surface-white py-16 border-t border-border-subtle">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h3 className="text-text-charcoal text-2xl font-bold tracking-tight">Atölye Günlüğü</h3>
            <Link href="/blog" className="hidden sm:flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors group">
              Tüm Yazılar
              <span className="material-symbols-outlined ml-1 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="text-center py-16 bg-surface-warm rounded-lg border border-border-subtle">
            <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">article</span>
            <h3 className="text-xl font-semibold text-text-charcoal mb-2">Atölye Günlüğü Yakında</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">Sanat dünyasından haberler, sanatçı röportajları ve ilham verici hikayeler yakında burada olacak.</p>
            <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors">
              Blog Sayfasına Git
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
