"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

interface Listing {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "REMOVED";
  listingType: string;
  basePriceMinor: number;
  currency: string;
  baseQuantity: number;
  thumbnail: string | null;
  favoriteCount: number;
  reviewCount: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export default function SellPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED" | "REMOVED" | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/hesap?redirect=/sell");
      return;
    }

    fetchListings();
  }, [statusFilter, page, authLoading]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      const res = await fetch(`/api/seller/listings?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Ürünler yüklenemedi");
      }

      const data = await res.json();
      setListings(data.listings);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-gray-100 text-gray-700",
      PUBLISHED: "bg-green-100 text-green-700",
      ARCHIVED: "bg-yellow-100 text-yellow-700",
      REMOVED: "bg-red-100 text-red-700",
    };
    const labels = {
      DRAFT: "Taslak",
      PUBLISHED: "Yayında",
      ARCHIVED: "Arşivlendi",
      REMOVED: "Kaldırıldı",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.DRAFT}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <>
        <PageHeader title="Ürünlerim" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Ürünlerim" />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-charcoal">Ürünlerim</h1>
            <p className="text-text-secondary mt-1">
              {listings.length} ürün bulundu
            </p>
          </div>
          <Link
            href="/sell/new"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            + Yeni Ürün Ekle
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-surface-white rounded-lg border border-border-subtle p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "ALL"
                  ? "bg-primary text-white"
                  : "bg-background-ivory text-text-charcoal hover:bg-border-subtle"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => {
                setStatusFilter("DRAFT");
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "DRAFT"
                  ? "bg-primary text-white"
                  : "bg-background-ivory text-text-charcoal hover:bg-border-subtle"
              }`}
            >
              Taslak
            </button>
            <button
              onClick={() => {
                setStatusFilter("PUBLISHED");
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "PUBLISHED"
                  ? "bg-primary text-white"
                  : "bg-background-ivory text-text-charcoal hover:bg-border-subtle"
              }`}
            >
              Yayında
            </button>
            <button
              onClick={() => {
                setStatusFilter("ARCHIVED");
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "ARCHIVED"
                  ? "bg-primary text-white"
                  : "bg-background-ivory text-text-charcoal hover:bg-border-subtle"
              }`}
            >
              Arşivlendi
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="bg-surface-white rounded-lg border border-border-subtle p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">
              inventory_2
            </span>
            <h3 className="text-xl font-bold text-text-charcoal mb-2">Henüz ürün yok</h3>
            <p className="text-text-secondary mb-6">
              İlk ürününüzü ekleyerek başlayın
            </p>
            <Link
              href="/sell/new"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              + Yeni Ürün Ekle
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/sell/${listing.id}/edit`}>
                    <div className="aspect-square bg-background-ivory relative">
                      {listing.thumbnail ? (
                        <img
                          src={listing.thumbnail}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-text-secondary">
                            image
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(listing.status)}
                      </div>
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/sell/${listing.id}/edit`}>
                      <h3 className="font-semibold text-text-charcoal mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {listing.title}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
                      <span>
                        {(listing.basePriceMinor / 100).toFixed(2)} {listing.currency}
                      </span>
                      <span>Stok: {listing.baseQuantity}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span>❤️ {listing.favoriteCount}</span>
                      <span>⭐ {listing.reviewCount}</span>
                      <span>📦 {listing.orderCount}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/sell/${listing.id}/edit`}
                        className="flex-1 px-3 py-2 text-center bg-background-ivory text-text-charcoal rounded-lg hover:bg-primary hover:text-white transition-colors text-sm"
                      >
                        Düzenle
                      </Link>
                      {listing.status === "PUBLISHED" && (
                        <Link
                          href={`/urun/${listing.slug}`}
                          className="flex-1 px-3 py-2 text-center bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                        >
                          Görüntüle
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-border-subtle rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary"
                >
                  Önceki
                </button>
                <span className="px-4 py-2 text-text-secondary">
                  Sayfa {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-border-subtle rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}



