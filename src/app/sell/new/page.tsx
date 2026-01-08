"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import ImageUploader, { UploadedImage } from "@/components/ui/ImageUploader";

export default function NewListingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] = useState<"MADE_BY_SELLER" | "DESIGNED_BY_SELLER" | "SOURCED_BY_SELLER" | "VINTAGE">("MADE_BY_SELLER");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [media, setMedia] = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listingSlug, setListingSlug] = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<{
    canCreate: boolean;
    remaining: number | null;
    currentCount: number | null;
    limit: number | null;
  } | null>(null);

  // Fetch subscription limit info
  useEffect(() => {
    if (!authLoading && user) {
      fetch("/api/subscription")
        .then((res) => res.json())
        .then((data) => {
          if (data.limitInfo) {
            setLimitInfo(data.limitInfo);
          }
        })
        .catch(console.error);
    }
  }, [authLoading, user]);

  // Ensure listing exists before allowing image uploads
  const ensureListingExists = async () => {
    if (listingSlug) return listingSlug;

    try {
      const createRes = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingType,
          title: title || "Yeni Ürün",
          description: description || "",
          basePriceMinor: Math.round(parseFloat(price || "0") * 100),
          currency: "TRY",
          baseQuantity: parseInt(quantity || "1", 10),
          tags: [],
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || "Ürün oluşturulamadı");
      }

      const createData = await createRes.json();
      setListingSlug(createData.listing.slug);
      if (!title) {
        setTitle(createData.listing.title);
      }
      return createData.listing.slug;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ürün oluşturulamadı");
      return null;
    }
  };

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

    setSubmitting(true);

    try {
      let slug = listingSlug;

      // Create listing if not exists
      if (!slug) {
        const createRes = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingType,
            title: title.trim(),
            description: description.trim(),
            basePriceMinor: Math.round(priceValue * 100),
            currency: "TRY",
            baseQuantity: parseInt(quantity || "1", 10),
            tags,
          }),
        });

        if (!createRes.ok) {
          const data = await createRes.json();
          throw new Error(data.error || "Ürün oluşturulamadı");
        }

        const createData = await createRes.json();
        slug = createData.listing.slug;
        setListingSlug(slug);
      } else {
        // Update existing listing
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
      }

      // Publish if requested
      if (publish) {
        const publishRes = await fetch(`/api/listings/${slug}/publish`, {
          method: "POST",
        });

        if (!publishRes.ok) {
          const data = await publishRes.json();
          throw new Error(data.error || "Ürün yayınlanamadı");
        }

        router.push(`/urun/${slug}`);
      } else {
        router.push(`/sell/${slug}/edit`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/hesap?redirect=/sell/new");
    return null;
  }

  return (
    <>
      <PageHeader title="Yeni Ürün Ekle" />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Subscription Limit Indicator */}
        {limitInfo && (
          <div className={`mb-6 p-4 rounded-lg border ${
            limitInfo.canCreate
              ? limitInfo.remaining !== null && limitInfo.remaining !== Infinity && limitInfo.remaining <= 1
                ? "bg-amber-50 border-amber-200"
                : "bg-blue-50 border-blue-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${
                  limitInfo.canCreate ? "text-blue-600" : "text-red-600"
                }`}>
                  {limitInfo.canCreate ? "info" : "warning"}
                </span>
                <div>
                  <p className={`font-medium ${
                    limitInfo.canCreate ? "text-blue-900" : "text-red-900"
                  }`}>
                    {limitInfo.canCreate
                      ? limitInfo.remaining === Infinity
                        ? "Premium Plan: Sınırsız ürün yükleyebilirsiniz"
                        : `Bu ay ${limitInfo.currentCount ?? 0}/${limitInfo.limit} ürün yüklediniz`
                      : "Ürün ekleme limitinize ulaştınız"}
                  </p>
                  {limitInfo.canCreate && limitInfo.remaining !== Infinity && (
                    <p className="text-sm text-blue-700 mt-1">
                      {limitInfo.remaining} ürün hakkınız kaldı
                    </p>
                  )}
                </div>
              </div>
              {!limitInfo.canCreate && (
                <Link
                  href="/satici-paneli/abonelik"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-md transition-colors"
                >
                  Abonelik Yükselt
                </Link>
              )}
            </div>
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
                    placeholder="Örn: El Yapımı Seramik Vazo"
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
                    placeholder="Ürününüzü detaylıca açıklayın..."
                    rows={8}
                    className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    maxLength={10000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Ürün Tipi *
                  </label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="MADE_BY_SELLER">Satıcı Tarafından Yapıldı</option>
                    <option value="DESIGNED_BY_SELLER">Satıcı Tarafından Tasarlandı</option>
                    <option value="SOURCED_BY_SELLER">Satıcı Tarafından Tedarik Edildi</option>
                    <option value="VINTAGE">Vintage (20+ Yıl)</option>
                  </select>
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
                    placeholder="0.00"
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
                Yayınlamak için en az 1 görsel gereklidir (max 8 görsel)
              </p>

              <ImageUploader
                listingSlug={listingSlug}
                images={media}
                onImagesChange={(newImages) => {
                  setMedia(newImages);
                  // Ensure listing exists if images are being added
                  if (newImages.length > media.length && !listingSlug) {
                    ensureListingExists();
                  }
                }}
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
                  {submitting ? "Kaydediliyor..." : "Taslak Olarak Kaydet"}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={submitting || media.length === 0}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {submitting ? "Yayınlanıyor..." : "Yayınla"}
                </button>
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



