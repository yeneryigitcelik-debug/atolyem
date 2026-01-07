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

// Mock products for categories
const mockProducts = [
  { title: "Soyut Kompozisyon", artist: "Ayşe Demir", price: 3500, slug: "soyut-kompozisyon", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Mavi Harmoni", artist: "Mehmet Kaya", price: 2800, slug: "mavi-harmoni", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop", badge: "Limited" },
  { title: "Doğa Esintisi", artist: "Zeynep Yılmaz", price: 4200, slug: "doga-esintisi", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop", badge: "El Yapımı" },
  { title: "Şehir Manzarası", artist: "Ali Öztürk", price: 1900, slug: "sehir-manzarasi", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Toprak Tonu", artist: "Fatma Çelik", price: 2200, slug: "toprak-tonu", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop", badge: "El Yapımı" },
  { title: "Sonsuz Döngü", artist: "Emre Arslan", price: 5500, slug: "sonsuz-dongu", image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=400&h=400&fit=crop", badge: "Limited" },
  { title: "Gece Işıkları", artist: "Selin Koç", price: 3100, slug: "gece-isiklari", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Rüzgarın Sesi", artist: "Burak Şahin", price: 2600, slug: "ruzgarin-sesi", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop", badge: "El Yapımı" },
];

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


