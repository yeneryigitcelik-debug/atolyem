import ProductCard from "@/components/ui/ProductCard";
import ProfileHero from "@/components/ui/ProfileHero";
import Link from "next/link";

const artists: Record<string, { 
  name: string; 
  specialty: string; 
  bio: string; 
  location: string; 
  since: number; 
  instagram?: string; 
  website?: string;
  avatar: string;
  banner: string;
  tagline?: string;
  responseTime?: string;
  lastActive?: string;
}> = {
  "sinem-demirtas": { 
    name: "Sinem Demirtaş", 
    specialty: "Ressam", 
    bio: "Renklerin ve fırça darbelerinin dansı, ruhun özgürlüğüdür. Tuvallerimde doğanın ve insanın iç dünyasının buluştuğu anları yakalıyorum.", 
    location: "İstanbul", 
    since: 2018, 
    instagram: "sinemdemirtas.art",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&h=400&fit=crop",
    tagline: "Renklerle dans eden tualler",
    responseTime: "Genelde 1 saat içinde",
    lastActive: "Bugün",
  },
  "mehmet-demir": { 
    name: "Mehmet Demir", 
    specialty: "Seramik", 
    bio: "Toprak ve ateşin dansından doğan formlar yaratıyorum. Her eser benzersiz bir hikaye anlatır.", 
    location: "İzmir", 
    since: 2015, 
    instagram: "mehmetdemir_seramik", 
    website: "mehmetdemir.art",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600&h=400&fit=crop",
    tagline: "Toprağın şarkısı",
    responseTime: "Genelde 24 saat içinde",
    lastActive: "Bugün",
  },
  "ayse-yilmaz": { 
    name: "Ayşe Yılmaz", 
    specialty: "Heykel", 
    bio: "Taşın ve bronzun dilini konuşuyorum. Eserlerim mekana anlam katar.", 
    location: "Ankara", 
    since: 2019,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=1600&h=400&fit=crop",
    tagline: "Formların sessiz anlatısı",
    responseTime: "Genelde birkaç saat içinde",
    lastActive: "Dün",
  },
  "ali-ozturk": { 
    name: "Ali Öztürk", 
    specialty: "Fotoğraf", 
    bio: "Işığı ve anı yakalıyorum. Her fotoğraf bir duyguyu temsil eder.", 
    location: "Bursa", 
    since: 2016, 
    instagram: "aliozturk.photo",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1600&h=400&fit=crop",
    tagline: "Işıkla yazılan hikayeler",
    responseTime: "Genelde birkaç saat içinde",
    lastActive: "Bugün",
  },
  "fatma-celik": { 
    name: "Fatma Çelik", 
    specialty: "Tekstil", 
    bio: "Geleneksel dokuma tekniklerini modern tasarımlarla buluşturuyorum.", 
    location: "Denizli", 
    since: 2017,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&h=400&fit=crop",
    tagline: "İplikten sanata",
    responseTime: "Genelde 2-3 gün içinde",
    lastActive: "3 gün önce",
  },
  "emre-arslan": { 
    name: "Emre Arslan", 
    specialty: "Cam Sanatı", 
    bio: "Cam ile ışığın büyülü dansını yaratıyorum.", 
    location: "Eskişehir", 
    since: 2020, 
    website: "emrearslan.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=1600&h=400&fit=crop",
    tagline: "Cam ve ışığın dansı",
    responseTime: "Genelde 24 saat içinde",
    lastActive: "Bugün",
  },
};

const defaultArtist = {
  name: "Sanatçı",
  specialty: "Sanat",
  bio: "Sanatçı hakkında bilgi.",
  location: "Türkiye",
  since: 2020,
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
  banner: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&h=400&fit=crop",
  tagline: "Sanat tutkunu",
  responseTime: "Değişken",
  lastActive: "Bilinmiyor",
};

const mockProducts = [
  { title: "Soyut Kompozisyon", artist: "Sinem Demirtaş", price: 3500, slug: "soyut-kompozisyon", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Mavi Harmoni", artist: "Sinem Demirtaş", price: 2800, slug: "mavi-harmoni", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop", badge: "Limited" },
  { title: "Doğa Esintisi", artist: "Sinem Demirtaş", price: 4200, slug: "doga-esintisi", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Şehir Manzarası", artist: "Sinem Demirtaş", price: 1900, slug: "sehir-manzarasi", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=400&fit=crop", badge: "Orijinal" },
];

const mockCollections = [
  { name: "Doğa Serisi", count: 8, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&h=200&fit=crop" },
  { name: "Şehir Yaşamı", count: 5, image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=300&h=200&fit=crop" },
];

export default async function SanatciPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = artists[slug] || defaultArtist;

  return (
    <>
      {/* Profile Hero - Fixed banner with scroll-under content */}
      <ProfileHero
        displayName={artist.name}
        username={slug}
        avatarUrl={artist.avatar}
        bannerUrl={artist.banner}
        bio={artist.bio}
        location={artist.location}
        memberSince={`${artist.since}`}
        tagline={artist.tagline}
        profileType="artist"
        isVerified={true}
        specialty={artist.specialty}
        responseTime={artist.responseTime}
        lastActive={artist.lastActive}
        instagramHandle={artist.instagram}
        websiteUrl={artist.website}
        stats={{
          works: mockProducts.length,
          followers: 152,
          following: 48,
          rating: 4.9,
        }}
      />

      {/* Page Content - Scrollable, continues from ProfileHero */}
      <div className="relative z-10 bg-background-ivory">
        {/* Tabs */}
      <div className="bg-surface-white border-b border-border-subtle sticky top-20 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            <button className="py-4 border-b-2 border-primary text-primary font-medium flex items-center gap-2 whitespace-nowrap">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              Eserler
            </button>
            <button className="py-4 border-b-2 border-transparent text-text-secondary hover:text-text-charcoal font-medium flex items-center gap-2 transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined text-[20px]">collections</span>
              Koleksiyonlar
            </button>
            <button className="py-4 border-b-2 border-transparent text-text-secondary hover:text-text-charcoal font-medium flex items-center gap-2 transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined text-[20px]">info</span>
              Hakkında
            </button>
            <button className="py-4 border-b-2 border-transparent text-text-secondary hover:text-text-charcoal font-medium flex items-center gap-2 transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined text-[20px]">star</span>
              Değerlendirmeler
            </button>
          </div>
        </div>
      </div>

      {/* Collections Preview */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
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
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                  style={{ backgroundImage: `url('${artistData.avatar}')` }}
                />
              </div>
              <p className="mt-3 font-medium text-text-charcoal group-hover:text-primary transition-colors text-sm">{artistData.name}</p>
              <p className="text-xs text-text-secondary">{artistData.specialty}</p>
            </Link>
          ))}
        </div>
      </section>
      </div>
    </>
  );
}
