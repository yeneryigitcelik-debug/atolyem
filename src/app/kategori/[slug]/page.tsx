import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";

// Mock category data
const categories: Record<string, { name: string; description: string }> = {
  tablolar: { name: "Tablolar", description: "Özgün resimler, tuval üzerine yağlı boya, akrilik ve suluboya eserler." },
  seramik: { name: "Seramik", description: "El yapımı seramik eserler, vazolar, kaplar ve dekoratif objeler." },
  heykel: { name: "Heykel", description: "Bronz, taş, ahşap ve modern malzemelerden üretilmiş heykeller." },
  fotograf: { name: "Fotoğraf", description: "Sanat fotoğrafları, limited edition baskılar ve dijital eserler." },
  tekstil: { name: "Tekstil", description: "El dokuması halılar, kilimler, duvar süsleri ve tekstil sanatı." },
  cam: { name: "Cam", description: "Üflemeli cam, vitray ve cam sanatı eserleri." },
};

// Products will be fetched from API - empty until API integration
interface Product {
  id: string;
  title: string;
  artist: string;
  price: number;
  slug: string;
  image: string;
  artistSlug?: string;
}
const mockProducts: Product[] = [];

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories[slug] || { name: "Kategori", description: "Bu kategorideki eserleri keşfedin." };

  return (
    <>
      <PageHeader title={category.name} description={category.description} />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full">Tümü</button>
            <button className="px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">En Yeniler</button>
            <button className="px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Popüler</button>
            <button className="px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Fiyat: Düşük-Yüksek</button>
          </div>
          <p className="text-sm text-text-secondary">{mockProducts.length} eser bulundu</p>
        </div>

        {/* Products Grid */}
        {mockProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockProducts.map((product) => (
                <ProductCard key={product.slug} {...product} />
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
          <div className="text-center py-16 bg-surface-white rounded-lg border border-border-subtle">
            <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">category</span>
            <h3 className="text-xl font-semibold text-text-charcoal mb-2">Bu kategoride henüz eser yok</h3>
            <p className="text-text-secondary mb-6">Yakında harika eserler burada görünecek.</p>
            <Link href="/kesfet" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors">
              Tüm Eserleri Keşfet
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>

      {/* Related Categories */}
      <section className="bg-surface-warm border-t border-border-subtle py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-bold text-text-charcoal mb-6">Diğer Kategoriler</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {Object.entries(categories).filter(([key]) => key !== slug).map(([key, cat]) => (
              <Link
                key={key}
                href={`/kategori/${key}`}
                className="whitespace-nowrap px-6 py-3 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors font-medium rounded-md"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}




