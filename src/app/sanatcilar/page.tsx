import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

const artists = [
  { name: "Sinem Demirtaş", specialty: "Ressam", slug: "sinem-demirtas", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", works: 24, featured: true },
  { name: "Mehmet Demir", specialty: "Seramik", slug: "mehmet-demir", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", works: 18, featured: true },
  { name: "Ayşe Yılmaz", specialty: "Heykel", slug: "ayse-yilmaz", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop", works: 12, featured: false },
  { name: "Ali Öztürk", specialty: "Fotoğraf", slug: "ali-ozturk", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop", works: 36, featured: false },
  { name: "Fatma Çelik", specialty: "Tekstil", slug: "fatma-celik", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop", works: 15, featured: true },
  { name: "Emre Arslan", specialty: "Cam Sanatı", slug: "emre-arslan", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop", works: 21, featured: false },
  { name: "Selin Koç", specialty: "Karışık Teknik", slug: "selin-koc", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", works: 28, featured: false },
  { name: "Burak Şahin", specialty: "Ahşap İşleme", slug: "burak-sahin", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop", works: 9, featured: false },
];

export default function SanatcilarPage() {
  const featuredArtists = artists.filter(a => a.featured);
  const allArtists = artists;

  return (
    <>
      <PageHeader 
        title="Sanatçılar" 
        description="Türkiye'nin en yetenekli sanatçılarını keşfedin ve eserlerini inceleyin."
      />

      {/* Featured Artists */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-text-charcoal mb-8">Öne Çıkan Sanatçılar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredArtists.map((artist) => (
            <Link key={artist.slug} href={`/sanatci/${artist.slug}`} className="group">
              <div className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-lg">
                <div className="aspect-[4/3] overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url('${artist.image}')` }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-[12px] mr-1">verified</span>
                      Doğrulanmış
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-text-charcoal group-hover:text-primary transition-colors">{artist.name}</h3>
                  <p className="text-text-secondary text-sm mt-1">{artist.specialty}</p>
                  <p className="text-text-secondary text-xs mt-3">{artist.works} eser</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Artists */}
      <section className="bg-surface-warm border-y border-border-subtle py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-text-charcoal">Tüm Sanatçılar</h2>
            <div className="flex gap-2">
              <select className="px-4 py-2 bg-surface-white border border-border-subtle rounded-md text-sm text-text-charcoal focus:outline-none focus:border-primary">
                <option>Tüm Kategoriler</option>
                <option>Resim</option>
                <option>Seramik</option>
                <option>Heykel</option>
                <option>Fotoğraf</option>
                <option>Tekstil</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {allArtists.map((artist) => (
              <Link key={artist.slug} href={`/sanatci/${artist.slug}`} className="group">
                <div className="bg-surface-white rounded-lg border border-border-subtle p-4 hover:border-primary transition-all duration-300 hover:shadow-md text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url('${artist.image}')` }}
                    />
                  </div>
                  <h3 className="font-semibold text-text-charcoal group-hover:text-primary transition-colors">{artist.name}</h3>
                  <p className="text-text-secondary text-sm mt-1">{artist.specialty}</p>
                  <p className="text-text-secondary text-xs mt-2">{artist.works} eser</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-primary rounded-lg p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Siz de Sanatçı Olun</h3>
          <p className="text-white/80 max-w-xl mx-auto mb-8">Eserlerinizi binlerce sanat severe ulaştırın. Atölyem.net&apos;te satış yapmak çok kolay.</p>
          <Link href="/sanatci-ol" className="inline-flex px-8 py-3 bg-white text-primary font-semibold rounded-md hover:bg-gray-100 transition-colors">
            Hemen Başla
          </Link>
        </div>
      </section>
    </>
  );
}


