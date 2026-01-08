"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import ImageUploader, { UploadedImage } from "@/components/ui/ImageUploader";

export default function EditListingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] = useState<"MADE_BY_SELLER" | "DESIGNED_BY_SELLER" | "SOURCED_BY_SELLER" | "VINTAGE">("MADE_BY_SELLER");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [media, setMedia] = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    if (!listingId || authLoading) return;

    const fetchListing = async () => {
      try {
        // First try by ID, if that fails try by slug
        let res = await fetch(`/api/listings/${listingId}`);
        if (!res.ok) {
          // Try to get seller listings to find by ID
          const sellerRes = await fetch("/api/seller/listings");
          if (!sellerRes.ok) throw new Error("Ürün bulunamadı");
          const sellerData = await sellerRes.json();
          const listing = sellerData.listings.find((l: any) => l.id === listingId || l.slug === listingId);
          if (!listing) throw new Error("Ürün bulunamadı");
          res = await fetch(`/api/listings/${listing.slug}`);
          if (!res.ok) throw new Error("Ürün bulunamadı");
        }

        const data = await res.json();
        const listing = data.listing;

        setSlug(listing.slug);
        setTitle(listing.title);
        setDescription(listing.description || "");
        setListingType(listing.listingType);
        setPrice((listing.basePriceMinor / 100).toFixed(2));
        setQuantity(listing.baseQuantity.toString());
        setStatus(listing.status);
        setTags(listing.tags || []);
        setMedia((listing.media || []).map((m: any) => ({
          id: m.id,
          url: m.url,
          sortOrder: m.sortOrder,
          isPrimary: m.isPrimary,
          altText: m.altText,
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ürün yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, authLoading]);


  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 13) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async (publish: boolean) => {
    setError(null);

    if (!title.trim() || title.length < 3) {
      setError("Başlık en az 3 karakter olmalıdır");
      return;
    }

    if (!description.trim() || description.length < 10) {
      setError("Açıklama en az 10 karakter olmalıdır");
      return;
    }

    const priceValue = parseFloat(price);
    if (!price || priceValue <= 0) {
      setError("Geçerli bir fiyat girin");
      return;
    }

    if (publish && media.length === 0) {
      setError("Yayınlamak için en az 1 görsel gereklidir");
      return;
    }

    if (!slug) {
      setError("Ürün bulunamadı");
      return;
    }

    setSubmitting(true);

    try {
      // Update listing
      const updateRes = await fetch(`/api/listings/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          basePriceMinor: Math.round(priceValue * 100),
          baseQuantity: parseInt(quantity || "1", 10),
        }),
      });

      if (!updateRes.ok) {
        const data = await updateRes.json();
        throw new Error(data.error || "Ürün güncellenemedi");
      }

      // Publish if requested and not already published
      if (publish && status !== "PUBLISHED") {
        const publishRes = await fetch(`/api/listings/${slug}/publish`, {
          method: "POST",
        });

        if (!publishRes.ok) {
          const data = await publishRes.json();
          throw new Error(data.error || "Ürün yayınlanamadı");
        }

        router.push(`/urun/${slug}`);
      } else {
        router.push("/sell");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push(`/hesap?redirect=/sell/${listingId}/edit`);
    return null;
  }

  return (
    <>
      <PageHeader title="Ürünü Düzenle" />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
              <h2 className="text-xl font-bold text-text-charcoal mb-4">Temel Bilgiler</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Ürün Başlığı *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    maxLength={10000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Durum
                  </label>
                  <div className="px-4 py-2 bg-background-ivory rounded-lg">
                    <span className="text-sm font-medium">
                      {status === "DRAFT" && "Taslak"}
                      {status === "PUBLISHED" && "Yayında"}
                      {status === "ARCHIVED" && "Arşivlendi"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
              <h2 className="text-xl font-bold text-text-charcoal mb-4">Fiyat & Stok</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Fiyat (TL) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Stok Adedi *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
              <h2 className="text-xl font-bold text-text-charcoal mb-4">Etiketler</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  placeholder="Etiket ekle (max 13)"
                  className="flex-1 px-4 py-2 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  maxLength={50}
                />
                <button
                  onClick={handleAddTag}
                  disabled={tags.length >= 13}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  Ekle
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-dark"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-sm text-text-secondary mt-2">
                {tags.length}/13 etiket kullanıldı
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
              <h2 className="text-xl font-bold text-text-charcoal mb-4">Görseller</h2>
              <p className="text-sm text-text-secondary mb-4">
                Sürükle-bırak ile sıralayabilirsiniz (max 8 görsel)
              </p>

              <ImageUploader
                listingSlug={slug}
                images={media}
                onImagesChange={setMedia}
                maxImages={8}
                disabled={submitting}
              />
            </div>

            {/* Actions */}
            <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
              <div className="space-y-3">
                <button
                  onClick={() => handleSave(false)}
                  disabled={submitting}
                  className="w-full py-3 bg-surface-white border border-border-subtle text-text-charcoal rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {submitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
                {status !== "PUBLISHED" && (
                  <button
                    onClick={() => handleSave(true)}
                    disabled={submitting || media.length === 0}
                    className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Yayınlanıyor..." : "Yayınla"}
                  </button>
                )}
                {status === "PUBLISHED" && (
                  <Link
                    href={`/urun/${slug}`}
                    className="block w-full py-3 text-center bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Ürün Sayfasını Görüntüle
                  </Link>
                )}
                <Link
                  href="/sell"
                  className="block w-full py-3 text-center text-text-secondary hover:text-text-charcoal transition-colors"
                >
                  İptal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



