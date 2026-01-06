import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";

const categories = [
  { name: "Tablolar", slug: "tablolar", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop" },
  { name: "Seramik", slug: "seramik", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop" },
  { name: "Heykel", slug: "heykel", image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=200&h=200&fit=crop" },
  { name: "Fotoğraf", slug: "fotograf", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=200&h=200&fit=crop" },
  { name: "Tekstil", slug: "tekstil", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop" },
  { name: "Cam", slug: "cam", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=200&h=200&fit=crop" },
];

const featuredProducts = [
  { title: "Soyut Kompozisyon", artist: "Ayşe Demir", price: 3500, slug: "soyut-kompozisyon", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", badge: "Editör Seçimi" },
  { title: "Mavi Harmoni", artist: "Mehmet Kaya", price: 2800, slug: "mavi-harmoni", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop", badge: "Editör Seçimi" },
  { title: "Doğa Esintisi", artist: "Zeynep Yılmaz", price: 4200, slug: "doga-esintisi", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop", badge: "Editör Seçimi" },
  { title: "Şehir Manzarası", artist: "Ali Öztürk", price: 1900, slug: "sehir-manzarasi", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=400&fit=crop", badge: "Editör Seçimi" },
];

const allProducts = [
  { title: "Toprak Tonu", artist: "Fatma Çelik", price: 2200, slug: "toprak-tonu", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop", badge: "El Yapımı" },
  { title: "Sonsuz Döngü", artist: "Emre Arslan", price: 5500, slug: "sonsuz-dongu", image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=400&h=400&fit=crop", badge: "Limited" },
  { title: "Gece Işıkları", artist: "Selin Koç", price: 3100, slug: "gece-isiklari", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Rüzgarın Sesi", artist: "Burak Şahin", price: 2600, slug: "ruzgarin-sesi", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop", badge: "El Yapımı" },
  { title: "Deniz Mavisi", artist: "Canan Ak", price: 1800, slug: "deniz-mavisi", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Altın Işık", artist: "Hakan Yıldız", price: 4500, slug: "altin-isik", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop", badge: "Limited" },
  { title: "Bahar Ezgisi", artist: "Derya Aksoy", price: 2900, slug: "bahar-ezgisi", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop", badge: "El Yapımı" },
  { title: "Kış Sessizliği", artist: "Oğuz Eren", price: 3800, slug: "kis-sessizligi", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=400&fit=crop", badge: "Orijinal" },
];

export default function KesfetPage() {
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
              <div className="w-16 h-16 rounded-full overflow-hidden bg-background-ivory">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url('${category.image}')` }}
                />
              </div>
              <span className="text-sm font-medium text-text-charcoal group-hover:text-primary transition-colors">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Editor's Picks */}
      <section className="bg-surface-warm border-y border-border-subtle py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-text-charcoal">Editör Seçkileri</h2>
              <p className="text-text-secondary mt-1">Bu hafta öne çıkan eserler</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allProducts.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors font-medium rounded-md">
            Daha Fazla Yükle
          </button>
        </div>
      </section>
    </>
  );
}

