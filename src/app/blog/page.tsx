import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

const featuredPost = {
  title: "Sanatçının Atölyesine Yolculuk: Sinem Demirtaş ile Söyleşi",
  excerpt: "Resmin ustası Sinem Demirtaş'ın atölyesini ziyaret ettik. Üretim sürecinin perde arkasındaki ilham kaynaklarını ve tekniklerini keşfettik.",
  slug: "sanatcinin-atolyesine-yolculuk",
  image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=600&fit=crop",
  date: "15 Ocak 2026",
  category: "Sanatçı Röportajları",
};

const posts = [
  { title: "Evde Sanat Koleksiyonu Nasıl Oluşturulur?", excerpt: "Başlangıç seviyesindeki koleksiyonerler için bütçe dostu ve etkili ipuçları.", slug: "evde-sanat-koleksiyonu", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=400&fit=crop", date: "12 Ocak 2026", category: "Rehber" },
  { title: "El Yapımı Seramiklerin Bakımı", excerpt: "Seramik eserlerinizi uzun yıllar ilk günkü gibi korumanın püf noktaları.", slug: "seramik-bakimi", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop", date: "10 Ocak 2026", category: "Bakım" },
  { title: "2026 Sanat Trendleri", excerpt: "Bu yıl sanat dünyasında öne çıkacak akımlar ve eğilimler.", slug: "2026-sanat-trendleri", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=400&fit=crop", date: "8 Ocak 2026", category: "Trend" },
  { title: "Minimalist Mekanlar İçin Sanat Seçimi", excerpt: "Az ama öz: Minimalist yaşam alanlarınız için sanat eseri seçim rehberi.", slug: "minimalist-mekanlar-sanat", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop", date: "5 Ocak 2026", category: "Dekorasyon" },
  { title: "Yerel Sanatçıları Desteklemenin Önemi", excerpt: "Yerel sanatçılardan alışveriş yapmanın ekonomik ve kültürel faydaları.", slug: "yerel-sanatci-destegi", image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=600&h=400&fit=crop", date: "2 Ocak 2026", category: "Topluluk" },
  { title: "Sanat Eseri Nasıl Çerçevelenir?", excerpt: "Eserlerinizi profesyonelce çerçevelemek için adım adım kılavuz.", slug: "sanat-eseri-cerceleme", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop", date: "28 Aralık 2025", category: "Rehber" },
];

export default function BlogPage() {
  return (
    <>
      <PageHeader 
        title="Atölye Günlüğü" 
        description="Sanat dünyasından haberler, sanatçı röportajları ve ilham verici hikayeler."
      />

      {/* Featured Post */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/blog/${featuredPost.slug}`} className="group block">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-surface-white rounded-lg border border-border-subtle overflow-hidden hover:border-primary transition-all duration-300">
            <div className="aspect-video lg:aspect-auto overflow-hidden">
              <div
                className="w-full h-full min-h-[300px] bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url('${featuredPost.image}')` }}
              />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{featuredPost.category}</span>
                <span className="text-text-secondary text-sm">{featuredPost.date}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-charcoal group-hover:text-primary transition-colors mb-4">{featuredPost.title}</h2>
              <p className="text-text-secondary leading-relaxed mb-6">{featuredPost.excerpt}</p>
              <span className="inline-flex items-center text-primary font-medium group-hover:underline">
                Devamını Oku
                <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* All Posts */}
      <section className="bg-surface-warm border-y border-border-subtle py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-text-charcoal">Tüm Yazılar</h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button className="whitespace-nowrap px-4 py-2 bg-primary text-white text-sm font-medium rounded-full">Tümü</button>
              <button className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Rehber</button>
              <button className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Röportaj</button>
              <button className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Trend</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-md">
                  <div className="aspect-video overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${post.image}')` }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-0.5 bg-background-ivory text-text-secondary text-xs font-medium rounded">{post.category}</span>
                      <span className="text-text-secondary text-xs">{post.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-text-charcoal group-hover:text-primary transition-colors mb-2">{post.title}</h3>
                    <p className="text-text-secondary text-sm line-clamp-2">{post.excerpt}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors font-medium rounded-md">
              Daha Fazla Yükle
            </button>
          </div>
        </div>
      </section>
    </>
  );
}


