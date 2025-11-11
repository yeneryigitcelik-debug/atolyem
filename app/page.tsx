import Link from "next/link";
import ProductImage from "./components/ProductImage";
import { getFeaturedProducts, getNewProducts, type ProductListItem } from "@/lib/data";

// Route-level revalidate: 300 saniye (5 dakika)
export const revalidate = 300;

export default async function Home() {
  // Öne çıkan ürünler (cache'lenmiş)
  let featuredProducts: ProductListItem[] = [];
  let newProducts: ProductListItem[] = [];

  try {
    [featuredProducts, newProducts] = await Promise.all([
      getFeaturedProducts(4).catch(() => [] as ProductListItem[]),
      getNewProducts(4, 4).catch(() => [] as ProductListItem[]),
    ]);
  } catch (error) {
    console.error("Home page data fetch error:", error);
    // Fallback değerler kullanılıyor
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1">
              <div className="my-6 @container">
                <div className="@[480px]:p-4">
                  <div
                    className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4 text-center"
                    data-alt="A vibrant collage of Turkish handmade crafts, including colorful ceramics, intricate jewelry, and woven textiles, arranged aesthetically."
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(13, 27, 25, 0.4) 0%, rgba(13, 27, 25, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuA1lDN10e6v0wKlfTMzYcM46_C3ud6y_wNLx0TqPS_U3SHH7xHb7c-QdDjtyvRCp7bxSzaTC1qJUNVT8UokH-QVTvKYsTMDAezSynKGjmAg2YhbNz3BhWrsPj1nYBKMgK9DKDdA9OFd0_TTcw9rwuapThZY4hJsZcRB2omgAsmGQac5-10JJrvZsv8fQa_xX05LtBUI-HBf1ehpL34CzkkmfpRBverv5Sn2Cnt0hXar6OzCxLisGSfMCliFGySjJbvU8G7ehFADffo")',
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-6xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                        El Yapımı Türk Sanatını Keşfedin
                      </h1>
                      <h2 className="text-gray-200 text-sm font-normal leading-normal @[480px]:text-lg @[480px]:font-normal @[480px]:leading-normal">
                        Yetenekli zanaatkarlardan eşsiz eserler, kapınıza gelsin.
                      </h2>
                    </div>
                    <Link
                      href="/pazar"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-secondary transition-colors"
                    >
                      <span className="truncate">Şimdi Alışveriş Yap</span>
                    </Link>
                  </div>
                </div>
              </div>

              <section className="my-10">
                <h2 className="text-[#1F2937] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                  Öne Çıkan Ürünler
                </h2>
                {featuredProducts.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-600">
                    <p>Henüz öne çıkan ürün bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 p-4">
                    {featuredProducts.map((product) => {
                      const minPrice = product.variants[0]?.priceCents || 0;
                      const imageUrl = product.images[0]?.url || "https://via.placeholder.com/400x400?text=Görsel+Yok";
                      const sellerName = product.seller.user.name || product.seller.displayName || product.seller.user.email || "Sanatçı";

                      return (
                        <div key={product.id} className="flex flex-col gap-3 pb-3 group">
                          <Link
                            href={`/products/${product.slug}`}
                            className="block"
                          >
                            <div className="w-full aspect-[3/4] rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 bg-surface-light dark:bg-surface-dark">
                              <ProductImage
                                src={imageUrl}
                                alt={product.images[0]?.alt || product.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </Link>
                          <div>
                            {product.category && (
                              <Link
                                href={`/search?category=${product.category.slug}`}
                                className="text-xs text-gray-500 hover:text-[#D97706] transition-colors"
                              >
                                {product.category.name}
                              </Link>
                            )}
                            <Link
                              href={`/products/${product.slug}`}
                              className="block"
                            >
                              <p className="text-[#1F2937] text-base font-medium leading-normal">
                                {product.title}
                              </p>
                              <p className="text-gray-600 text-sm font-normal leading-normal">
                                {sellerName} tarafından
                              </p>
                              <p className="text-[#1F2937] text-sm font-medium leading-normal">
                                {minPrice > 0 ? `${(minPrice / 100).toLocaleString("tr-TR")} TL` : "Fiyat yok"}
                              </p>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="my-10">
                <h2 className="text-[#1F2937] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                  Yeni Gelenler
                </h2>
                {newProducts.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-600">
                    <p>Henüz yeni ürün bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 p-4">
                    {newProducts.map((product) => {
                      const minPrice = product.variants[0]?.priceCents || 0;
                      const imageUrl = product.images[0]?.url || "https://via.placeholder.com/400x400?text=Görsel+Yok";
                      const sellerName = product.seller.user.name || product.seller.displayName || product.seller.user.email || "Sanatçı";

                      return (
                        <div key={product.id} className="flex flex-col gap-3 pb-3 group">
                          <Link
                            href={`/products/${product.slug}`}
                            className="block"
                          >
                            <div className="w-full aspect-[3/4] rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 bg-surface-light dark:bg-surface-dark">
                              <ProductImage
                                src={imageUrl}
                                alt={product.images[0]?.alt || product.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </Link>
                          <div>
                            {product.category && (
                              <Link
                                href={`/search?category=${product.category.slug}`}
                                className="text-xs text-gray-500 hover:text-[#D97706] transition-colors"
                              >
                                {product.category.name}
                              </Link>
                            )}
                            <Link
                              href={`/products/${product.slug}`}
                              className="block"
                            >
                              <p className="text-[#1F2937] text-base font-medium leading-normal">
                                {product.title}
                              </p>
                              <p className="text-gray-600 text-sm font-normal leading-normal">
                                {sellerName} tarafından
                              </p>
                              <p className="text-[#1F2937] text-sm font-medium leading-normal">
                                {minPrice > 0 ? `${(minPrice / 100).toLocaleString("tr-TR")} TL` : "Fiyat yok"}
                              </p>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </main>

            <div className="w-full">
              <section className="bg-surface-light dark:bg-surface-dark py-12 md:py-20">
                <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-2">
                      Atölyem nedir?
                    </h2>
                    <Link className="text-primary hover:underline font-medium" href="/about">
                      Hikâyemizi oku →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-12">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        <span className="material-symbols-outlined text-4xl text-primary">groups</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">Yaratıcı bir topluluk</h3>
                      <p className="text-gray-600 text-sm">
                        Türkiye'nin dört bir yanından sanatçıları, tasarımcıları ve zanaatkarları bir araya
                        getirerek özgün ve el yapımı ürünlerin sergilendiği bir pazar yeri sunuyoruz.
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        <span className="material-symbols-outlined text-4xl text-primary">storefront</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">Bağımsız üreticilere destek</h3>
                      <p className="text-gray-600 text-sm">
                        Küçük atölyelerin ve bağımsız sanatçıların tutkularını sürdürülebilir bir işe
                        dönüştürmelerine yardımcı oluyoruz. Her alışveriş, yerel ekonomiyi ve yaratıcılığı
                        destekler.
                      </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        <span className="material-symbols-outlined text-4xl text-primary">verified_user</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">Güvenli ve kolay alışveriş</h3>
                      <p className="text-gray-600 text-sm">
                        Güvenli ödeme altyapımız, alıcı koruma programımız ve kullanıcı dostu arayüzümüz ile
                        alışveriş deneyiminizi sorunsuz ve keyifli hale getiriyoruz.
                      </p>
                    </div>
                  </div>
                  <div className="text-center border-t border-border pt-8">
                    <p className="text-lg font-bold mb-3">Sorun mu var?</p>
                    <Link
                      className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-secondary transition-colors"
                      href="/help"
                    >
                      Destek Merkezine Git
                    </Link>
                  </div>
                </div>
              </section>

              <section className="bg-surface-light dark:bg-surface-dark py-12 md:py-16">
                <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 text-center">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Yeni ürünler ve özel teklifler için kaydolun.
                  </h3>
                  <div className="max-w-md mx-auto">
                    <form className="flex flex-col sm:flex-row gap-2">
                      <input
                        className="form-input flex-grow rounded-lg border-border bg-white dark:bg-surface-dark placeholder:text-subtle-light dark:placeholder:text-subtle-dark focus:ring-primary focus:border-primary text-sm h-12 px-4"
                        placeholder="E-posta adresiniz"
                        type="email"
                      />
                      <button
                        className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-sm h-12 hover:bg-secondary transition-colors"
                        type="submit"
                      >
                        Abone Ol
                      </button>
                    </form>
                    <p className="text-xs text-gray-600 mt-3">
                      Abone olarak <Link className="underline" href="/privacy">Gizlilik Politikamızı</Link> kabul etmiş
                      olursunuz.
                    </p>
                  </div>
                </div>
              </section>

              <div className="text-center py-6 bg-background-light dark:bg-background-dark">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="material-symbols-outlined text-lg text-green-600">eco</span>
                  <span>Atölyem, yerel üretimi ve bilinçli tüketimi teşvik eder.</span>
                </div>
                <p className="text-xs text-gray-600">
                  Satın aldığın her ürün bir atölyenin ışığını açık tutar.
                </p>
              </div>
            </div>

            <footer className="mt-auto border-t border-solid border-border py-10 px-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center gap-4 text-[#1F2937] mb-4">
                    <div className="size-6 text-primary">
                      <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path
                          clipRule="evenodd"
                          d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                          fill="currentColor"
                          fillRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <h2 className="text-[#1F2937] text-lg font-bold">atolyem.net</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    Otantik Türk işçiliğine açılan kapınız.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-4">Mağaza</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      <Link className="hover:text-primary" href="/kategori/seramik">
                        Seramik
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/kategori/taki">
                        Takı
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/kategori/tablo">
                        Resim
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/kategori/giyim">
                        Tekstil
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/kategori/ev-dekor">
                        Ev Dekoru
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-4">Hakkında</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      <Link className="hover:text-primary" href="/about">
                        Hikayemiz
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/artists">
                        Sanatçılarla Tanışın
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/become-seller">
                        Satıcı Ol
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/contact">
                        Bize Ulaşın
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/help">
                        Yardım Merkezi
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-4">Yasal & Destek</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      <Link className="hover:text-primary" href="/terms">
                        Kullanım Şartları
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/privacy">
                        Gizlilik Politikası
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/returns">
                        İade Politikası
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/shipping">
                        Kargo & Teslimat
                      </Link>
                    </li>
                    <li>
                      <Link className="hover:text-primary" href="/track-order">
                        Sipariş Takibi
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-4">Topluluğumuza Katılın</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Gelen kutunuza ilham ve özel teklifler alın.
                  </p>
                  <form className="flex">
                    <input
                      className="form-input flex-grow rounded-l-lg border-border bg-surface-light dark:bg-surface-dark placeholder:text-subtle-light dark:placeholder:text-subtle-dark focus:ring-primary focus:border-primary text-sm"
                      placeholder="E-postanız"
                      type="email"
                    />
                    <button
                      className="bg-primary text-white px-4 py-2 rounded-r-lg font-bold text-sm hover:bg-secondary transition-colors"
                      type="submit"
                    >
                      Abone Ol
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-solid border-border text-center text-sm text-gray-600">
                <p>© 2024 atolyem.net. Tüm hakları saklıdır.</p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
