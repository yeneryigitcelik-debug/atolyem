import Link from "next/link";

// Mock data for categories
const categories = [
  { name: "Tablolar", slug: "tablolar", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop" },
  { name: "Seramik", slug: "seramik", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop" },
  { name: "Heykel", slug: "heykel", image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=200&h=200&fit=crop" },
  { name: "Fotoğraf", slug: "fotograf", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=200&h=200&fit=crop" },
  { name: "Tekstil", slug: "tekstil", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop" },
  { name: "Cam", slug: "cam", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=200&h=200&fit=crop" },
];

// Mock data for collections
const collections = [
  { title: "Modern Minimalist", desc: "Sade formlar ve nötr renklerin huzurlu uyumu.", slug: "modern-minimalist", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=800&fit=crop" },
  { title: "Anadolu Dokuları", desc: "Geleneksel motiflerin modern yorumları.", slug: "anadolu-dokulari", image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&h=800&fit=crop" },
  { title: "Doğadan İlham", desc: "Organik materyaller ve sürdürülebilir sanat.", slug: "dogadan-ilham", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=800&fit=crop" },
];

// Mock data for products
const newProducts = [
  { title: "Mavi Düşler No.4", artist: "Elif Yılmaz", price: 2500, badge: "Orijinal", slug: "mavi-dusler-no4", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop" },
  { title: "Benekli Seramik Kupa", artist: "Toprak Atölyesi", price: 450, badge: "El Yapımı", slug: "benekli-seramik-kupa", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop" },
  { title: "Özgürlük Heykeli", artist: "Caner Demir", price: 8000, badge: "Limited", slug: "ozgurluk-heykeli", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop" },
  { title: "Dokuma Duvar Süsü", artist: "İplik Studio", price: 1200, badge: "El Yapımı", slug: "dokuma-duvar-susu", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
];

const popularProducts = [
  { title: "Vazo No.12", artist: "Seramik Atölyesi", price: 650, slug: "vazo-no12", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=500&fit=crop" },
  { title: "Yeşil Vadi", artist: "Ahmet Yılmaz", price: 3200, slug: "yesil-vadi", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=500&fit=crop" },
  { title: "Ahşap Sandalye", artist: "WoodArt", price: 5500, slug: "ahsap-sandalye", image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=500&fit=crop" },
  { title: "Cam Obje", artist: "Glass Master", price: 1800, slug: "cam-obje", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=500&fit=crop" },
  { title: "Metal Form", artist: "Metal İşleri", price: 4200, slug: "metal-form", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop" },
];

const blogPosts = [
  { title: "Sanatçının Atölyesine Yolculuk", desc: "Üretim sürecinin perde arkasındaki ilham kaynaklarını ve teknikleri keşfedin.", slug: "sanatcinin-atolyesine-yolculuk", image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop" },
  { title: "Evde Sanat Koleksiyonu Nasıl Oluşturulur?", desc: "Başlangıç seviyesindeki koleksiyonerler için bütçe dostu ve etkili ipuçları.", slug: "evde-sanat-koleksiyonu", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=400&fit=crop" },
  { title: "El Yapımı Seramiklerin Bakımı", desc: "Seramik eserlerinizi uzun yıllar ilk günkü gibi korumanın püf noktaları.", slug: "seramik-bakimi", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop" },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="flex flex-col gap-6 order-2 lg:order-1 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-charcoal leading-[1.1] tracking-tight">
              Atölyelerden çıkan <br className="hidden lg:block" /> <span className="text-primary italic">özgün</span> eserler.
            </h2>
            <p className="text-lg sm:text-xl text-text-secondary max-w-lg mx-auto lg:mx-0 font-light leading-relaxed">
              Küratöryel seçkiler, doğrulanmış satıcılar ve güvenli alışveriş ile eviniz için en özel parçaları keşfedin.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/kesfet"
                className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white text-base font-semibold rounded-md shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Keşfet
              </Link>
              <Link
                href="/sanatci-ol"
                className="px-8 py-3.5 bg-transparent border border-border-subtle text-text-charcoal hover:border-primary hover:bg-primary/5 text-base font-semibold rounded-md transition-all duration-300"
              >
                Sanatçı Ol
              </Link>
            </div>
          </div>

          {/* Image Grid */}
          <div className="relative order-1 lg:order-2 h-[400px] sm:h-[500px] w-full">
            <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-surface-white rounded-lg overflow-hidden shadow-lg z-10 transform translate-x-4 -translate-y-4">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop')" }}
              />
            </div>
            <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-surface-white rounded-lg overflow-hidden shadow-lg z-20 border-4 border-background-ivory">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop')" }}
              />
            </div>
            {/* Decorative Circle */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* Quick Discovery Categories */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategori/${category.slug}`}
              className="group flex flex-col items-center gap-3 p-4 bg-surface-white rounded-md border border-border-subtle hover:border-primary transition-all duration-300 hover:shadow-md cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-background-ivory">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url('${category.image}')` }}
                />
              </div>
              <span className="text-sm font-medium text-text-charcoal group-hover:text-primary transition-colors">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Collections - Curator Picks */}
      <section className="bg-surface-warm py-16 border-y border-border-subtle/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-text-charcoal text-2xl font-bold tracking-tight">Editör Seçkileri</h3>
              <p className="text-text-secondary mt-1">Bu ayın öne çıkan koleksiyonlarını keşfedin.</p>
            </div>
            <Link href="/koleksiyonlar" className="hidden sm:flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors group">
              Tüm Koleksiyonlar
              <span className="material-symbols-outlined ml-1 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link key={collection.slug} href={`/koleksiyon/${collection.slug}`} className="group relative cursor-pointer">
                <div className="aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-lg bg-gray-200">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${collection.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                </div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h4 className="text-white text-xl font-bold mb-1">{collection.title}</h4>
                  <p className="text-white/80 text-sm mb-3 line-clamp-1">{collection.desc}</p>
                  <span className="text-white text-sm font-medium border-b border-white/40 pb-0.5 group-hover:border-white transition-colors">Koleksiyonu Gör</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 sm:hidden text-center">
            <Link href="/koleksiyonlar" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors">
              Tüm Koleksiyonlar
              <span className="material-symbols-outlined ml-1 text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals - Product Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <h3 className="text-text-charcoal text-2xl font-bold tracking-tight">Yeni Eklenenler</h3>
          <Link href="/yeni-gelenler" className="hidden sm:flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors group">
            Tümünü Gör
            <span className="material-symbols-outlined ml-1 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/urun/${product.slug}`}
              className="group bg-surface-white rounded-md border border-border-subtle hover:border-primary transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative"
            >
              <button className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 rounded-full text-text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
              <div className="aspect-square overflow-hidden rounded-t-md bg-gray-100">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${product.image}')` }} />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-background-ivory border border-border-subtle ${product.badge === "Orijinal" || product.badge === "Limited" ? "text-primary" : "text-text-secondary"}`}>
                    {product.badge}
                  </span>
                </div>
                <h4 className="text-text-charcoal font-semibold text-lg leading-tight truncate">{product.title}</h4>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-xs text-text-secondary">Sanatçı: <span className="text-text-charcoal font-medium">{product.artist}</span></p>
                  </div>
                  <span className="text-text-charcoal font-bold">{product.price.toLocaleString("tr-TR")} TL</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust / Quality Strip */}
      <section className="border-y border-border-subtle bg-surface-warm/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h3 className="sr-only">Neden Atölyem?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-text-charcoal mt-1">verified_user</span>
              <div>
                <h4 className="text-text-charcoal font-semibold mb-1">Küratöryel Seçki</h4>
                <p className="text-sm text-text-secondary leading-relaxed">Uzman editörlerimiz tarafından titizlikle seçilen özgün eserler.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-text-charcoal mt-1">lock</span>
              <div>
                <h4 className="text-text-charcoal font-semibold mb-1">Güvenli Ödeme</h4>
                <p className="text-sm text-text-secondary leading-relaxed">256-bit SSL şifreleme ile korunan güvenli ödeme altyapısı.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-text-charcoal mt-1">local_shipping</span>
              <div>
                <h4 className="text-text-charcoal font-semibold mb-1">Şeffaf Kargo</h4>
                <p className="text-sm text-text-secondary leading-relaxed">Eseriniz size ulaşana kadar adım adım takip ve sigorta.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-text-charcoal mt-1">person_check</span>
              <div>
                <h4 className="text-text-charcoal font-semibold mb-1">Doğrulanmış Satıcı</h4>
                <p className="text-sm text-text-secondary leading-relaxed">Tüm sanatçılarımız kimlik ve portfolyo kontrolünden geçer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Spotlight */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image */}
            <div className="w-full lg:w-1/2 min-h-[400px]">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop')" }}
              />
            </div>
            {/* Content */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <span className="text-primary font-semibold tracking-wide text-sm uppercase mb-2">Ayın Sanatçısı</span>
              <h3 className="text-3xl font-bold text-text-charcoal mb-4">Sinem Demirtaş</h3>
              <p className="text-text-secondary text-lg leading-relaxed mb-8">
                &quot;Renklerin ve fırça darbelerinin dansı, ruhun özgürlüğüdür. Tuvallerimde doğanın ve insanın iç dünyasının buluştuğu anları yakalıyorum.&quot;
              </p>
              {/* Mini Gallery */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop')" }} />
                </div>
                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549887534-1541e9326642?w=200&h=200&fit=crop')" }} />
                </div>
                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200&h=200&fit=crop')" }} />
                </div>
              </div>
              <Link href="/sanatci/sinem-demirtas" className="self-start px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors shadow-sm">
                Sanatçıyı İncele
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular / Trending Carousel */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-text-charcoal text-2xl font-bold tracking-tight">Şu An Popüler</h3>
        </div>
        {/* Category Chips */}
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2">
          <button className="whitespace-nowrap px-4 py-2 bg-primary text-white text-sm font-medium rounded-full shadow-sm">Tümü</button>
          <Link href="/kategori/tablolar" className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Soyut Resim</Link>
          <Link href="/kategori/seramik" className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">El Yapımı Seramik</Link>
          <Link href="/kategori/tekstil" className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Duvar Dekoru</Link>
          <Link href="/kategori/heykel" className="whitespace-nowrap px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors text-sm font-medium rounded-full">Modern Heykel</Link>
        </div>
        {/* Horizontal Scroll Container */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x">
          {popularProducts.map((product) => (
            <Link key={product.slug} href={`/urun/${product.slug}`} className="min-w-[280px] w-[280px] snap-start">
              <div className="group bg-surface-white rounded-md border border-border-subtle hover:border-primary transition-all duration-300 relative">
                <div className="aspect-[3/4] overflow-hidden rounded-t-md bg-gray-100">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${product.image}')` }} />
                </div>
                <div className="p-4">
                  <h4 className="text-text-charcoal font-semibold text-base truncate">{product.title}</h4>
                  <p className="text-xs text-text-secondary mt-1">{product.artist}</p>
                  <p className="text-text-charcoal font-bold mt-2">{product.price.toLocaleString("tr-TR")} TL</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="bg-surface-white py-16 border-t border-border-subtle">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h3 className="text-text-charcoal text-2xl font-bold tracking-tight">Atölye Günlüğü</h3>
            <Link href="/blog" className="hidden sm:flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors group">
              Tüm Yazılar
              <span className="material-symbols-outlined ml-1 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="flex flex-col gap-4 group cursor-pointer">
                <div className="aspect-video overflow-hidden rounded-md bg-gray-200">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${post.image}')` }}
                  />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-text-charcoal mb-2 group-hover:text-primary transition-colors">{post.title}</h4>
                  <p className="text-text-secondary text-sm mb-3 line-clamp-2">{post.desc}</p>
                  <span className="text-primary text-sm font-medium border-b border-primary/20 pb-0.5 group-hover:border-primary transition-colors inline-block">Devamını Oku</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
