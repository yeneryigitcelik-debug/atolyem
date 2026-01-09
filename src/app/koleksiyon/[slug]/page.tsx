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
        {mockProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-white rounded-lg border border-border-subtle">
            <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">collections</span>
            <h3 className="text-xl font-semibold text-text-charcoal mb-2">Bu koleksiyonda henüz eser yok</h3>
            <p className="text-text-secondary mb-6">Yakında harika eserler burada görünecek.</p>
            <Link href="/kesfet" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors">
              Tüm Eserleri Keşfet
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        )}
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




