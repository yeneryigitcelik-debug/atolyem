import Link from "next/link";
import CommentSection from "@/components/blog/CommentSection";

const posts: Record<string, { title: string; content: string; date: string; category: string; author: string }> = {
  "sanatcinin-atolyesine-yolculuk": {
    title: "Sanatçının Atölyesine Yolculuk: Sinem Demirtaş ile Söyleşi",
    content: `Resmin ustası Sinem Demirtaş'ın atölyesini ziyaret ettik. İstanbul'un kalbindeki bu küçük ama büyülü mekanda, sanatçının üretim sürecine tanıklık ettik.

"Renklerin ve fırça darbelerinin dansı, ruhun özgürlüğüdür," diyor Sinem Demirtaş, elindeki fırçayı tuvale yaklaştırırken. "Her sabah uyandığımda, o günün renklerini hissediyorum. Bazen mavi, bazen toprak tonları..."

Atölyesinin her köşesi ilham verici detaylarla dolu. Duvarlarda asılı yarım kalmış çalışmalar, yerde birikmiş boya lekeleri, masanın üzerinde düzensiz dizilmiş fırçalar... Her şey tam olması gerektiği gibi.

"Modern şehir hayatının kaosuna karşı bir sığınak yaratmak istiyorum," diye ekliyor. "Eserlerim, izleyiciye bir nefes alma alanı sunmalı."

Sinem Demirtaş'ın eserleri Atölyem.net'te satışta. Koleksiyonuna göz atmak için sayfasını ziyaret edebilirsiniz.`,
    date: "15 Ocak 2026",
    category: "Sanatçı Röportajları",
    author: "Editöryel Ekip",
  },
  "evde-sanat-koleksiyonu": {
    title: "Evde Sanat Koleksiyonu Nasıl Oluşturulur?",
    content: `Sanat koleksiyonu oluşturmak kulağa göz korkutucu gelebilir, ancak doğru yaklaşımla herkes kendi küçük galerisini evinde yaratabilir.

**1. Bütçenizi Belirleyin**
İlk adım, ne kadar harcayabileceğinizi belirlemektir. Unutmayın, pahalı olmak zorunda değil. Genç sanatçıların eserleri hem uygun fiyatlı hem de değer kazanma potansiyeli yüksek.

**2. Neyi Sevdiğinizi Keşfedin**
Galeri ve sergileri ziyaret edin, online platformları gezin. Hangi tarz, renk ve formlar size hitap ediyor? Koleksiyonunuz sizin kişiliğinizi yansıtmalı.

**3. Mekanınızı Düşünün**
Eserinizin asılacağı duvarı hayal edin. Boyut, renk uyumu ve ışık önemli faktörler.

**4. Orijinalliği Tercih Edin**
Mümkünse orijinal eserler satın alın. Baskılar yerine, sanatçının elinden çıkmış özgün parçalar her zaman daha değerli.

**5. Sabırlı Olun**
Koleksiyon oluşturmak zaman alır. Acele etmeyin, doğru parçalar karşınıza çıkacaktır.`,
    date: "12 Ocak 2026",
    category: "Rehber",
    author: "Selin Yılmaz",
  },
  "seramik-bakimi": {
    title: "El Yapımı Seramiklerin Bakımı",
    content: `El yapımı seramikler, fabrika ürünlerinden farklı olarak özel bakım gerektirir. İşte seramik eserlerinizi uzun yıllar korumanın yolları.

**Günlük Temizlik**
Yumuşak, nemli bir bezle silin. Aşındırıcı temizleyiciler kullanmayın. Sıcak su ve hafif sabun yeterlidir.

**Sıcaklık Şokuna Dikkat**
Ani sıcaklık değişimleri seramiğe zarar verebilir. Bulaşık makinesine koymadan önce üreticiye danışın.

**Doğru Saklama**
Seramikleri üst üste koyarken aralarına yumuşak bez yerleştirin. Çizilmeleri önler.

**Çatlak ve Kırıklar**
Küçük çatlaklar için profesyonel onarım hizmetleri mevcuttur. Değerli parçalar için mutlaka uzmana danışın.

**Sergileme**
Doğrudan güneş ışığından kaçının. Bazı glazürler zamanla solabilir.`,
    date: "10 Ocak 2026",
    category: "Bakım",
    author: "Mehmet Demir",
  },
};

const relatedPosts = [
  { title: "2026 Sanat Trendleri", slug: "2026-sanat-trendleri", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop" },
  { title: "Minimalist Mekanlar İçin Sanat", slug: "minimalist-mekanlar-sanat", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop" },
  { title: "Yerel Sanatçıları Destekleme", slug: "yerel-sanatci-destegi", image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=400&h=300&fit=crop" },
];

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug] || {
    title: "Blog Yazısı",
    content: "İçerik bulunamadı.",
    date: "1 Ocak 2026",
    category: "Genel",
    author: "Editör",
  };

  return (
    <>
      {/* Hero */}
      <div className="bg-surface-warm border-b border-border-subtle">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-text-charcoal line-clamp-1">{post.title}</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{post.category}</span>
            <span className="text-text-secondary text-sm">{post.date}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-charcoal mb-4">{post.title}</h1>
          <p className="text-text-secondary">Yazar: {post.author}</p>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 -mt-0">
        <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=600&fit=crop')" }}
          />
        </div>
      </div>

      {/* Content */}
      <article className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          {post.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return <h3 key={i} className="text-xl font-bold text-text-charcoal mt-8 mb-4">{paragraph.replace(/\*\*/g, '')}</h3>;
            }
            if (paragraph.startsWith('**')) {
              const parts = paragraph.split('**');
              return (
                <p key={i} className="text-text-secondary leading-relaxed mb-4">
                  <strong className="text-text-charcoal">{parts[1]}</strong>
                  {parts[2]}
                </p>
              );
            }
            return <p key={i} className="text-text-secondary leading-relaxed mb-4">{paragraph}</p>;
          })}
        </div>

        {/* Share */}
        <div className="flex items-center gap-4 mt-12 pt-8 border-t border-border-subtle">
          <span className="text-text-secondary text-sm">Paylaş:</span>
          <button className="p-2 text-text-secondary hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
          </button>
          <button className="p-2 text-text-secondary hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <CommentSection postSlug={slug} />

      {/* Related Posts */}
      <section className="bg-surface-warm border-t border-border-subtle py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-charcoal mb-8">İlgili Yazılar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="group">
                <article className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden hover:border-primary transition-all duration-300">
                  <div className="aspect-video overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${relatedPost.image}')` }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-text-charcoal group-hover:text-primary transition-colors">{relatedPost.title}</h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}


