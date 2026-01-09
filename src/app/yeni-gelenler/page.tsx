import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import { getNewListings } from "@/lib/data/listings";

// Force dynamic rendering to always show fresh data
export const dynamic = "force-dynamic";

export default async function YeniGelenlerPage() {
  const listings = await getNewListings(24);

  return (
    <>
      <PageHeader 
        title="Yeni Gelenler" 
        description="Bu hafta platforma eklenen en yeni eserler."
        badge="Güncel"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {listings.length > 0 ? (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <button className="whitespace-nowrap px-4 py-2 bg-primary text-white text-sm font-medium rounded-full">Tümü</button>
                <button className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Bu Hafta</button>
                <button className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Bu Ay</button>
              </div>
              <select className="px-4 py-2 bg-surface-white border border-border-subtle rounded-md text-sm text-text-charcoal focus:outline-none focus:border-primary">
                <option>Sıralama: En Yeni</option>
                <option>Fiyat: Düşük-Yüksek</option>
                <option>Fiyat: Yüksek-Düşük</option>
              </select>
            </div>

            {/* Products Grid */}
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
                  badge="Yeni"
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors font-medium rounded-md">
                Daha Fazla Yükle
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-surface-white rounded-lg border border-border-subtle">
            <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">palette</span>
            <h3 className="text-xl font-semibold text-text-charcoal mb-2">Henüz yeni eser eklenmedi</h3>
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
      </div>
    </>
  );
}
