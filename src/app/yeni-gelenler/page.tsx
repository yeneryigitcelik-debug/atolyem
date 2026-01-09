import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";

const newProducts = [
  { title: "Soyut Kompozisyon", artist: "Ayşe Demir", price: 3500, slug: "soyut-kompozisyon", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", badge: "Yeni" },
  { title: "Mavi Harmoni", artist: "Mehmet Kaya", price: 2800, slug: "mavi-harmoni", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop", badge: "Yeni" },
  { title: "Doğa Esintisi", artist: "Zeynep Yılmaz", price: 4200, slug: "doga-esintisi", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop", badge: "Yeni" },
  { title: "Şehir Manzarası", artist: "Ali Öztürk", price: 1900, slug: "sehir-manzarasi", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=400&fit=crop", badge: "Yeni" },
  { title: "Toprak Tonu", artist: "Fatma Çelik", price: 2200, slug: "toprak-tonu", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop", badge: "Yeni" },
  { title: "Sonsuz Döngü", artist: "Emre Arslan", price: 5500, slug: "sonsuz-dongu", image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=400&h=400&fit=crop", badge: "Yeni" },
  { title: "Gece Işıkları", artist: "Selin Koç", price: 3100, slug: "gece-isiklari", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop", badge: "Yeni" },
  { title: "Rüzgarın Sesi", artist: "Burak Şahin", price: 2600, slug: "ruzgarin-sesi", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop", badge: "Yeni" },
];

export default function YeniGelenlerPage() {
  return (
    <>
      <PageHeader 
        title="Yeni Gelenler" 
        description="Bu hafta platforma eklenen en yeni eserler."
        badge="Güncel"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          {newProducts.map((product) => (
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
    </>
  );
}





