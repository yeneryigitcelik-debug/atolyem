import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import { getNewListings } from "@/lib/data/listings";

// Force dynamic rendering to always show fresh data
export const dynamic = "force-dynamic";

const categories = [
  { name: "Tablolar", slug: "tablolar", icon: "brush" },
  { name: "Seramik", slug: "seramik", icon: "water_drop" },
  { name: "Heykel", slug: "heykel", icon: "view_in_ar" },
  { name: "Fotoğraf", slug: "fotograf", icon: "photo_camera" },
  { name: "Tekstil", slug: "tekstil", icon: "checkroom" },
  { name: "Cam", slug: "cam", icon: "wine_bar" },
];

export default async function KesfetPage() {
  const listings = await getNewListings(24);

  return (
    <>
      <PageHeader 
        title="Keşfet" 
        description="Türkiye'nin en yetenekli sanatçılarından özgün eserleri keşfedin."
        badge="Küratöryel Seçki"
      />

      {/* Categories */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold text-text-charcoal mb-6">Kategoriler</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategori/${category.slug}`}
              className="group flex flex-col items-center gap-3 p-4 bg-surface-white rounded-md border border-border-subtle hover:border-primary transition-all duration-300 hover:shadow-md"
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

      {/* All Products */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-text-charcoal">Tüm Eserler</h2>
          <div className="flex gap-2">
            <select className="px-4 py-2 bg-surface-white border border-border-subtle rounded-md text-sm text-text-charcoal focus:outline-none focus:border-primary">
              <option>Sıralama: Önerilen</option>
              <option>En Yeniler</option>
              <option>Fiyat: Düşük-Yüksek</option>
              <option>Fiyat: Yüksek-Düşük</option>
            </select>
          </div>
        </div>

        {listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
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
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors font-medium rounded-md">
                Daha Fazla Yükle
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-surface-white rounded-lg border border-border-subtle">
            <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">palette</span>
            <h3 className="text-xl font-semibold text-text-charcoal mb-2">Henüz eser eklenmedi</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Yakında harika eserler burada görünecek. Sanatçı olarak katılıp ilk eseri siz ekleyebilirsiniz!
            </p>
            <Link 
              href="/sanatci-ol" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors"
            >
              Sanatçı Olarak Katıl
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
