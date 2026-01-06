import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";

const artists: Record<string, { name: string; specialty: string; bio: string; location: string; since: number; instagram?: string; website?: string }> = {
  "zeynep-kaya": { name: "Zeynep Kaya", specialty: "Soyut Resim", bio: "Doğanın düzensizliğindeki mükemmelliği arıyorum. Eserlerim, modern şehir hayatının kaosuna karşı bir sığınak niteliğinde.", location: "İstanbul", since: 2018, instagram: "zeynepkaya.art" },
  "mehmet-demir": { name: "Mehmet Demir", specialty: "Seramik", bio: "Toprak ve ateşin dansından doğan formlar yaratıyorum. Her eser benzersiz bir hikaye anlatır.", location: "İzmir", since: 2015, instagram: "mehmetdemir_seramik", website: "mehmetdemir.art" },
  "ayse-yilmaz": { name: "Ayşe Yılmaz", specialty: "Heykel", bio: "Taşın ve bronzun dilini konuşuyorum. Eserlerim mekana anlam katar.", location: "Ankara", since: 2019 },
  "ali-ozturk": { name: "Ali Öztürk", specialty: "Fotoğraf", bio: "Işığı ve anı yakalıyorum. Her fotoğraf bir duyguyu temsil eder.", location: "Bursa", since: 2016, instagram: "aliozturk.photo" },
  "fatma-celik": { name: "Fatma Çelik", specialty: "Tekstil", bio: "Geleneksel dokuma tekniklerini modern tasarımlarla buluşturuyorum.", location: "Denizli", since: 2017 },
  "emre-arslan": { name: "Emre Arslan", specialty: "Cam Sanatı", bio: "Cam ile ışığın büyülü dansını yaratıyorum.", location: "Eskişehir", since: 2020, website: "emrearslan.com" },
};

const mockProducts = [
  { title: "Soyut Kompozisyon", artist: "Zeynep Kaya", price: 3500, slug: "soyut-kompozisyon", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Mavi Harmoni", artist: "Zeynep Kaya", price: 2800, slug: "mavi-harmoni", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop", badge: "Limited" },
  { title: "Doğa Esintisi", artist: "Zeynep Kaya", price: 4200, slug: "doga-esintisi", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Şehir Manzarası", artist: "Zeynep Kaya", price: 1900, slug: "sehir-manzarasi", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=400&fit=crop", badge: "Orijinal" },
];

const mockCollections = [
  { name: "Doğa Serisi", count: 8, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&h=200&fit=crop" },
  { name: "Şehir Yaşamı", count: 5, image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=300&h=200&fit=crop" },
];

export default async function SanatciPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = artists[slug] || { name: "Sanatçı", specialty: "Sanat", bio: "Sanatçı hakkında bilgi.", location: "Türkiye", since: 2020 };

  return (
    <>
      {/* Artist Header - Public Profile */}
      <div className="bg-surface-warm border-b border-border-subtle">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-surface-white shadow-lg shrink-0 relative">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop')" }}
              />
              {/* Online indicator */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white" title="Aktif" />
            </div>
            <div className="text-center md:text-left flex-grow">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-text-charcoal">{artist.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                  {/* Sanatçı Badge */}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white">
                    <span className="material-symbols-outlined text-[14px] mr-1">palette</span>
                    Sanatçı
                  </span>
                  {/* Verified Badge */}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[12px] mr-1">verified</span>
                    Doğrulanmış
                  </span>
                </div>
              </div>
              <p className="text-text-secondary text-lg">{artist.specialty}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  {artist.location}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  {artist.since}&apos;den beri
                </span>
              </div>
              <p className="text-text-secondary mt-6 max-w-2xl italic">&quot;{artist.bio}&quot;</p>
              
              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                {artist.instagram && (
                  <a 
                    href={`https://instagram.com/${artist.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    @{artist.instagram}
                  </a>
                )}
                {artist.website && (
                  <a 
                    href={`https://${artist.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">language</span>
                    {artist.website}
                  </a>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                <button className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  Takip Et
                </button>
                <button className="px-6 py-2.5 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-medium rounded-md transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                  Mesaj Gönder
                </button>
                <button className="p-2.5 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-md transition-colors">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-surface-white border-b border-border-subtle">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div className="cursor-pointer hover:text-primary transition-colors">
              <p className="text-2xl font-bold text-text-charcoal">{mockProducts.length}</p>
              <p className="text-sm text-text-secondary">Eser</p>
            </div>
            <div className="cursor-pointer hover:text-primary transition-colors">
              <p className="text-2xl font-bold text-text-charcoal">152</p>
              <p className="text-sm text-text-secondary">Takipçi</p>
            </div>
            <div className="cursor-pointer hover:text-primary transition-colors">
              <p className="text-2xl font-bold text-text-charcoal">48</p>
              <p className="text-sm text-text-secondary">Takip</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-charcoal">4.9</p>
              <p className="text-sm text-text-secondary">Puan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface-white border-b border-border-subtle sticky top-20 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button className="py-4 border-b-2 border-primary text-primary font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              Eserler
            </button>
            <button className="py-4 border-b-2 border-transparent text-text-secondary hover:text-text-charcoal font-medium flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-[20px]">collections</span>
              Koleksiyonlar
            </button>
            <button className="py-4 border-b-2 border-transparent text-text-secondary hover:text-text-charcoal font-medium flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-[20px]">info</span>
              Hakkında
            </button>
            <button className="py-4 border-b-2 border-transparent text-text-secondary hover:text-text-charcoal font-medium flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-[20px]">star</span>
              Değerlendirmeler
            </button>
          </div>
        </div>
      </div>

      {/* Collections Preview */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-lg font-semibold text-text-charcoal mb-4">Koleksiyonlar</h3>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {mockCollections.map((collection) => (
            <Link 
              key={collection.name}
              href="#"
              className="shrink-0 group"
            >
              <div className="w-40 h-28 rounded-lg overflow-hidden relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundImage: `url('${collection.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white font-medium text-sm">{collection.name}</p>
                  <p className="text-white/70 text-xs">{collection.count} eser</p>
                </div>
              </div>
            </Link>
          ))}
          <Link 
            href="#"
            className="shrink-0 w-40 h-28 rounded-lg border-2 border-dashed border-border-subtle flex items-center justify-center hover:border-primary transition-colors group"
          >
            <span className="text-text-secondary group-hover:text-primary transition-colors text-sm">Tümünü Gör</span>
          </Link>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-charcoal">Eserler</h2>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 border border-border-subtle rounded-md text-sm bg-surface-white focus:outline-none focus:border-primary">
              <option>En Yeni</option>
              <option>Fiyat: Düşükten Yükseğe</option>
              <option>Fiyat: Yüksekten Düşüğe</option>
              <option>En Popüler</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
      </div>

      {/* Reviews */}
      <section className="bg-surface-warm border-t border-border-subtle py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-text-charcoal">Değerlendirmeler</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[20px]">star</span>
                ))}
              </div>
              <span className="font-bold text-text-charcoal">4.9</span>
              <span className="text-text-secondary">(47 değerlendirme)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface-white rounded-lg border border-border-subtle p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-background-ivory flex items-center justify-center">
                    <span className="text-lg font-bold text-text-charcoal">AY</span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-text-charcoal">Ayşe Y.</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-primary">
                        {[...Array(5)].map((_, j) => (
                          <span key={j} className="material-symbols-outlined text-[14px]">star</span>
                        ))}
                      </div>
                      <span className="text-xs text-text-secondary">2 hafta önce</span>
                    </div>
                  </div>
                </div>
                <p className="text-text-secondary">Muhteşem bir eser aldım. Paketleme çok özenli, iletişim mükemmeldi. Kesinlikle tekrar alışveriş yapacağım.</p>
                {i % 2 === 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
                    <span className="text-text-secondary">Doğrulanmış Alışveriş</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="px-6 py-3 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-lg transition-colors">
              Tüm Değerlendirmeleri Gör
            </button>
          </div>
        </div>
      </section>

      {/* Similar Artists */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-text-charcoal mb-8">Benzer Sanatçılar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {Object.entries(artists).slice(0, 6).map(([artistSlug, artistData]) => (
            <Link 
              key={artistSlug}
              href={`/sanatci/${artistSlug}`}
              className="text-center group"
            >
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-border-subtle group-hover:border-primary transition-colors">
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop')" }}
                />
              </div>
              <p className="mt-3 font-medium text-text-charcoal group-hover:text-primary transition-colors text-sm">{artistData.name}</p>
              <p className="text-xs text-text-secondary">{artistData.specialty}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
