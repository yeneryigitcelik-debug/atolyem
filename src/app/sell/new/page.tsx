"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

interface ListingMedia {
  id: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
}

export default function NewListingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] = useState<"MADE_BY_SELLER" | "DESIGNED_BY_SELLER" | "SOURCED_BY_SELLER" | "VINTAGE">("MADE_BY_SELLER");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [media, setMedia] = useState<ListingMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listingSlug, setListingSlug] = useState<string | null>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      // Need to create listing first if not exists
      if (!listingSlug) {
        // Create draft listing first
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
        setTitle(createData.listing.title);
      }

      // Upload each file
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError("Sadece görsel dosyaları yüklenebilir");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("sortOrder", media.length.toString());
        formData.append("isPrimary", (media.length === 0).toString());

        const uploadRes = await fetch(`/api/listings/${listingSlug}/media`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          throw new Error(data.error || "Görsel yüklenemedi");
        }

        const uploadData = await uploadRes.json();
        setMedia((prev) => [...prev, uploadData.media]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenirken hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!listingSlug) return;

    try {
      const res = await fetch(`/api/listings/${listingSlug}/media/${mediaId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Görsel silinemedi");
      }

      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel silinirken hata oluştu");
    }
  };

  const handleSetPrimary = async (mediaId: string) => {
    if (!listingSlug) return;

    try {
      const res = await fetch(`/api/listings/${listingSlug}/media/${mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (!res.ok) {
        throw new Error("Ana görsel ayarlanamadı");
      }

      setMedia((prev) =>
        prev.map((m) => ({
          ...m,
          isPrimary: m.id === mediaId,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ana görsel ayarlanırken hata oluştu");
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-3 border-2 border-dashed border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                {uploading ? "Yükleniyor..." : "+ Görsel Ekle"}
              </button>

              <div className="mt-4 space-y-2">
                {media.map((img, index) => (
                  <div
                    key={img.id}
                    className="relative group border border-border-subtle rounded-lg overflow-hidden"
                  >
                    <img src={img.url} alt={`Görsel ${index + 1}`} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!img.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(img.id)}
                          className="px-3 py-1 bg-white text-text-charcoal rounded text-sm hover:bg-primary hover:text-white"
                        >
                          Ana Görsel
                        </button>
                      )}
                      {img.isPrimary && (
                        <span className="px-3 py-1 bg-primary text-white rounded text-sm">
                          Ana Görsel
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteMedia(img.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {media.length === 0 && (
                <p className="text-sm text-text-secondary mt-2">
                  Yayınlamak için en az 1 görsel gereklidir
                </p>
              )}
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

