import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";

const collections: Record<string, { title: string; description: string; curator: string }> = {
  "modern-minimalist": { title: "Modern Minimalist", description: "Sade formlar ve nötr renklerin huzurlu uyumu. Minimalist yaşam alanları için seçilmiş eserler.", curator: "Aylin Editör" },
  "anadolu-dokulari": { title: "Anadolu Dokuları", description: "Geleneksel Anadolu motiflerinin modern yorumları. Kültürel mirasımızı çağdaş tasarımla buluşturan eserler.", curator: "Mehmet Editör" },
  "dogadan-ilham": { title: "Doğadan İlham", description: "Organik materyaller ve sürdürülebilir sanat. Doğanın güzelliğini eve taşıyan eserler.", curator: "Zeynep Editör" },
  "sehir-hayati": { title: "Şehir Hayatı", description: "Urban estetiğin sanata yansıması. Şehir yaşamından ilham alan çağdaş eserler.", curator: "Can Editör" },
  "vintage": { title: "Vintage Koleksiyon", description: "20 yılı aşkın tarihi olan özel parçalar. Zamansız güzellik arayan koleksiyonerler için.", curator: "Selin Editör" },
  "yeni-nesil": { title: "Yeni Nesil Sanatçılar", description: "Genç yeteneklerin çağdaş eserleri. Geleceğin sanatını bugünden keşfedin.", curator: "Emre Editör" },
};

const mockProducts = [
  { title: "Soyut Kompozisyon", artist: "Ayşe Demir", price: 3500, slug: "soyut-kompozisyon", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", badge: "Koleksiyon Parçası" },
  { title: "Mavi Harmoni", artist: "Mehmet Kaya", price: 2800, slug: "mavi-harmoni", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop", badge: "Koleksiyon Parçası" },
  { title: "Doğa Esintisi", artist: "Zeynep Yılmaz", price: 4200, slug: "doga-esintisi", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop", badge: "Koleksiyon Parçası" },
  { title: "Şehir Manzarası", artist: "Ali Öztürk", price: 1900, slug: "sehir-manzarasi", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=400&fit=crop", badge: "Koleksiyon Parçası" },
  { title: "Toprak Tonu", artist: "Fatma Çelik", price: 2200, slug: "toprak-tonu", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop", badge: "Koleksiyon Parçası" },
  { title: "Sonsuz Döngü", artist: "Emre Arslan", price: 5500, slug: "sonsuz-dongu", image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=400&h=400&fit=crop", badge: "Koleksiyon Parçası" },
];

export default async function KoleksiyonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = collections[slug] || { title: "Koleksiyon", description: "Bu koleksiyondaki eserleri keşfedin.", curator: "Editör" };

  return (
    <>
      <PageHeader 
        title={collection.title} 
        description={collection.description}
        badge="Küratöryel Koleksiyon"
      />

      {/* Curator Note */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface-white border border-border-subtle rounded-lg p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
          </div>
          <div>
            <p className="text-text-secondary italic">&quot;Bu koleksiyon, modern yaşam alanları için özenle seçilmiş eserlerden oluşuyor. Her parça, mekanınıza karakter katacak.&quot;</p>
            <p className="text-sm text-text-charcoal font-medium mt-2">— {collection.curator}</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <p className="text-text-secondary">{mockProducts.length} eser</p>
          <select className="px-4 py-2 bg-surface-white border border-border-subtle rounded-md text-sm text-text-charcoal focus:outline-none focus:border-primary">
            <option>Sıralama: Önerilen</option>
            <option>En Yeniler</option>
            <option>Fiyat: Düşük-Yüksek</option>
            <option>Fiyat: Yüksek-Düşük</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
      </div>

      {/* Other Collections */}
      <section className="bg-surface-warm border-t border-border-subtle py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-bold text-text-charcoal mb-6">Diğer Koleksiyonlar</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {Object.entries(collections).filter(([key]) => key !== slug).slice(0, 4).map(([key, col]) => (
              <Link
                key={key}
                href={`/koleksiyon/${key}`}
                className="whitespace-nowrap px-6 py-3 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors font-medium rounded-md"
              >
                {col.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

