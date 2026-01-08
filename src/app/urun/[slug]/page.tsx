import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import AddToCartButton from "@/components/ui/AddToCartButton";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { prisma } from "@/lib/db/prisma";

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const listing = await prisma.listing.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      description: true,
      media: { where: { isPrimary: true }, take: 1, select: { url: true } },
      shop: { select: { shopName: true } },
    },
  });

  if (!listing) {
    return { title: "Ürün Bulunamadı | Atölyem.net" };
  }

  return {
    title: `${listing.title} | ${listing.shop?.shopName} | Atölyem.net`,
    description: listing.description?.slice(0, 160) || `${listing.title} - ${listing.shop?.shopName} tarafından satışa sunulan özgün eser.`,
    openGraph: {
      title: listing.title,
      description: listing.description?.slice(0, 160) || "",
      images: listing.media[0]?.url ? [{ url: listing.media[0].url }] : [],
    },
  };
}

export default async function UrunPage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch listing from database
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      shop: {
        select: {
          id: true,
          shopName: true,
          shopSlug: true,
          logoImageUrl: true,
          owner: {
            select: {
              publicProfile: {
                select: { username: true, displayName: true, avatarUrl: true },
              },
            },
          },
        },
      },
      media: { orderBy: { sortOrder: "asc" } },
      tags: { include: { tag: true } },
      attributes: true,
      _count: { select: { favorites: true, reviews: true } },
    },
  });

  if (!listing || listing.status !== "PUBLISHED") {
    notFound();
  }

  // Get related products from same shop
  const relatedProducts = await prisma.listing.findMany({
    where: {
      shopId: listing.shopId,
      status: "PUBLISHED",
      id: { not: listing.id },
    },
    take: 4,
    select: {
      title: true,
      slug: true,
      basePriceMinor: true,
      shop: { select: { shopName: true, owner: { select: { publicProfile: { select: { username: true } } } } } },
      media: { where: { isPrimary: true }, take: 1, select: { url: true } },
      tags: { take: 1, include: { tag: true } },
    },
  });

  const price = listing.basePriceMinor / 100;
  const primaryImage = listing.media.find(m => m.isPrimary) || listing.media[0];
  const artistUsername = listing.shop?.owner?.publicProfile?.username;

  return (
    <>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/kesfet" className="hover:text-primary transition-colors">Keşfet</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-text-charcoal">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-surface-white rounded-lg overflow-hidden border border-border-subtle relative">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="material-symbols-outlined text-6xl text-gray-300">image</span>
                </div>
              )}
            </div>
            {listing.media.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.media.slice(0, 4).map((media, i) => (
                  <div key={media.id} className="aspect-square bg-surface-white rounded-md overflow-hidden border border-border-subtle cursor-pointer hover:border-primary transition-colors relative">
                    <Image
                      src={media.url}
                      alt={`${listing.title} - ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {listing.tags.slice(0, 2).map((t) => (
                <span key={t.tag.id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                  {t.tag.name}
                </span>
              ))}
              {listing.isHandmadeClaimed && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-background-ivory text-text-secondary border border-border-subtle">El Yapımı</span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-text-charcoal mb-2">{listing.title}</h1>
            
            {/* Artist Info */}
            {artistUsername && (
              <Link href={`/sanatsever/${artistUsername}`} className="flex items-center gap-3 mb-4 group">
                {listing.shop?.owner?.publicProfile?.avatarUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden relative">
                    <Image
                      src={listing.shop.owner.publicProfile.avatarUrl}
                      alt={listing.shop.shopName || ""}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">{listing.shop?.shopName?.[0]}</span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-text-charcoal group-hover:text-primary transition-colors">{listing.shop?.shopName}</p>
                  <p className="text-xs text-text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">palette</span>
                    Sanatçı
                  </p>
                </div>
              </Link>
            )}

            <div className="mt-6 pb-6 border-b border-border-subtle">
              <p className="text-3xl font-bold text-text-charcoal">{price.toLocaleString("tr-TR")} TL</p>
              <p className="text-sm text-text-secondary mt-1">KDV dahil</p>
            </div>

            {listing.description && (
              <div className="py-6 border-b border-border-subtle">
                <p className="text-text-secondary leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Details */}
            {listing.attributes.length > 0 && (
              <div className="py-6 border-b border-border-subtle">
                <h3 className="font-semibold text-text-charcoal mb-4">Ürün Detayları</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  {listing.attributes.map((attr) => (
                    <div key={attr.id}>
                      <dt className="text-text-secondary">{attr.key}</dt>
                      <dd className="text-text-charcoal font-medium">{attr.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Actions - Sticky on mobile */}
            <div className="py-6 space-y-4 sticky bottom-0 bg-surface-white lg:relative lg:bg-transparent">
              <AddToCartButton listingId={listing.id} />
              <div className="flex gap-4">
                <FavoriteButton listingId={listing.id} variant="outline" className="flex-1" />
                <button className="flex-1 py-4 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-semibold rounded-md transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">share</span>
                  Paylaş
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-6 border-t border-border-subtle">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                Ücretsiz kargo
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
                Orijinallik garantisi
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">replay</span>
                14 gün iade
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">lock</span>
                Güvenli ödeme
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-surface-warm border-t border-border-subtle py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-text-charcoal mb-8">Sanatçının Diğer Eserleri</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  title={product.title}
                  artist={product.shop?.shopName || ""}
                  price={product.basePriceMinor / 100}
                  slug={product.slug}
                  image={product.media[0]?.url || ""}
                  badge={product.tags[0]?.tag?.name}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
