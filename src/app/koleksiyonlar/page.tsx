import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

const collections = [
  { title: "Modern Minimalist", desc: "Sade formlar ve nötr renklerin huzurlu uyumu.", slug: "modern-minimalist", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=800&fit=crop", count: 24 },
  { title: "Anadolu Dokuları", desc: "Geleneksel motiflerin modern yorumları.", slug: "anadolu-dokulari", image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&h=800&fit=crop", count: 18 },
  { title: "Doğadan İlham", desc: "Organik materyaller ve sürdürülebilir sanat.", slug: "dogadan-ilham", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=800&fit=crop", count: 32 },
  { title: "Şehir Hayatı", desc: "Urban estetiğin sanata yansıması.", slug: "sehir-hayati", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=800&fit=crop", count: 15 },
  { title: "Vintage Koleksiyon", desc: "20 yılı aşkın tarihi olan özel parçalar.", slug: "vintage", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop", count: 42 },
  { title: "Yeni Nesil Sanatçılar", desc: "Genç yeteneklerin çağdaş eserleri.", slug: "yeni-nesil", image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=800&fit=crop", count: 28 },
];

export default function KoleksiyonlarPage() {
  return (
    <>
      <PageHeader 
        title="Koleksiyonlar" 
        description="Editörlerimiz tarafından özenle derlenen tematik koleksiyonları keşfedin."
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link key={collection.slug} href={`/koleksiyon/${collection.slug}`} className="group relative cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-200">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${collection.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium mb-3">
                  {collection.count} eser
                </span>
                <h3 className="text-white text-2xl font-bold mb-2">{collection.title}</h3>
                <p className="text-white/80 text-sm mb-4">{collection.desc}</p>
                <span className="inline-flex items-center text-white text-sm font-medium group-hover:underline">
                  Koleksiyonu Keşfet
                  <span className="material-symbols-outlined ml-1 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}


