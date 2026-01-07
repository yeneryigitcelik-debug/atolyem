import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";

const products: Record<string, { title: string; artist: string; artistSlug: string; price: number; description: string; details: { material: string; size: string; year: number } }> = {
  "soyut-kompozisyon": { title: "Soyut Kompozisyon", artist: "Ayşe Demir", artistSlug: "ayse-demir", price: 3500, description: "Bu eser, modern soyut sanatın en güzel örneklerinden biri. Canlı renkler ve dinamik fırça darbeleriyle mekanınıza enerji katacak.", details: { material: "Tuval üzeri akrilik", size: "80x100 cm", year: 2024 } },
  "mavi-harmoni": { title: "Mavi Harmoni", artist: "Mehmet Kaya", artistSlug: "mehmet-kaya", price: 2800, description: "Mavi tonlarının huzur veren dansı. Minimalist bir yaklaşımla oluşturulmuş bu eser, her ortama uyum sağlar.", details: { material: "Tuval üzeri yağlı boya", size: "60x80 cm", year: 2024 } },
  "doga-esintisi": { title: "Doğa Esintisi", artist: "Zeynep Yılmaz", artistSlug: "zeynep-yilmaz", price: 4200, description: "Doğanın renkleri ve formlarından ilham alan organik bir kompozisyon.", details: { material: "Karışık teknik", size: "100x120 cm", year: 2023 } },
};

const relatedProducts = [
  { title: "Toprak Tonu", artist: "Fatma Çelik", price: 2200, slug: "toprak-tonu", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop", badge: "El Yapımı" },
  { title: "Sonsuz Döngü", artist: "Emre Arslan", price: 5500, slug: "sonsuz-dongu", image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=400&h=400&fit=crop", badge: "Limited" },
  { title: "Gece Işıkları", artist: "Selin Koç", price: 3100, slug: "gece-isiklari", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Rüzgarın Sesi", artist: "Burak Şahin", price: 2600, slug: "ruzgarin-sesi", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop", badge: "El Yapımı" },
];

export default async function UrunPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products[slug] || { 
    title: "Ürün", 
    artist: "Sanatçı", 
    artistSlug: "sanatci", 
    price: 1000, 
    description: "Ürün açıklaması.", 
    details: { material: "Bilinmiyor", size: "Bilinmiyor", year: 2024 } 
  };

  return (
    <>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/kesfet" className="hover:text-primary transition-colors">Keşfet</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-text-charcoal">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-surface-white rounded-lg overflow-hidden border border-border-subtle">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop')" }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-surface-white rounded-md overflow-hidden border border-border-subtle cursor-pointer hover:border-primary transition-colors">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop')" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">Orijinal</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-background-ivory text-text-secondary border border-border-subtle">El Yapımı</span>
            </div>
            <h1 className="text-3xl font-bold text-text-charcoal mb-2">{product.title}</h1>
            <Link href={`/sanatci/${product.artistSlug}`} className="text-text-secondary hover:text-primary transition-colors">
              {product.artist}
            </Link>

            <div className="mt-6 pb-6 border-b border-border-subtle">
              <p className="text-3xl font-bold text-text-charcoal">{product.price.toLocaleString("tr-TR")} TL</p>
              <p className="text-sm text-text-secondary mt-1">KDV dahil</p>
            </div>

            <div className="py-6 border-b border-border-subtle">
              <p className="text-text-secondary leading-relaxed">{product.description}</p>
            </div>

            {/* Details */}
            <div className="py-6 border-b border-border-subtle">
              <h3 className="font-semibold text-text-charcoal mb-4">Ürün Detayları</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-text-secondary">Malzeme</dt>
                  <dd className="text-text-charcoal font-medium">{product.details.material}</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Boyut</dt>
                  <dd className="text-text-charcoal font-medium">{product.details.size}</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Yıl</dt>
                  <dd className="text-text-charcoal font-medium">{product.details.year}</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Durum</dt>
                  <dd className="text-text-charcoal font-medium">Yeni</dd>
                </div>
              </dl>
            </div>

            {/* Actions */}
            <div className="py-6 space-y-4">
              <button className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">shopping_bag</span>
                Sepete Ekle
              </button>
              <button className="w-full py-4 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-semibold rounded-md transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">favorite</span>
                Favorilere Ekle
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-6 border-t border-border-subtle">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                Ücretsiz kargo
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
                Orijinallik garantisi
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">replay</span>
                14 gün iade
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">lock</span>
                Güvenli ödeme
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className="bg-surface-warm border-t border-border-subtle py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-charcoal mb-8">Benzer Eserler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}


