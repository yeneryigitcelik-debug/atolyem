"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ArtistProfile {
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  isArtist: boolean;
  memberSince: string;
  shopSlug: string | null;
  shopName: string | null;
  stats: {
    favorites: number;
    following: number;
    followers: number;
    reviews: number;
  };
}

interface Listing {
  id: string;
  title: string;
  slug: string;
  listingType: string;
  basePriceMinor: number;
  currency: string;
  baseQuantity: number;
  shop: {
    id: string;
    shopName: string;
    shopSlug: string;
  };
  thumbnail: string | null;
  favoriteCount: number;
  reviewCount: number;
  createdAt: string;
}

interface ShopInfo {
  id: string;
  shopName: string;
  shopSlug: string;
  shopBio: string | null;
  shopAvatarUrl: string | null;
  bannerUrl: string | null;
}

export default function AtolyePage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useAuth();

  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Fetch artist profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profiles/${username}`);
        if (!res.ok) {
          setError(res.status === 404 ? "not_found" : "error");
          return;
        }
        const data = await res.json();
        
        if (!data.profile.isArtist) {
          setError("not_artist");
          return;
        }
        
        setProfile(data.profile);
      } catch {
        setError("error");
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchProfile();
    }
  }, [username]);

  // Fetch shop info and listings
  const fetchListings = useCallback(async () => {
    if (!profile || !profile.shopSlug) return;

    setListingsLoading(true);
    try {
      // Get listings for this artist via their shop slug
      const sortParam = sortBy === "newest" ? "created_desc" : sortBy === "price_asc" ? "price_asc" : sortBy === "price_desc" ? "price_desc" : "created_desc";
      const listingsRes = await fetch(`/api/listings?shopSlug=${profile.shopSlug}&limit=50&sortBy=${sortParam}`);
      
      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setListings(data.listings || []);
        
        // Get shop info from first listing
        if (data.listings?.length > 0) {
          setShop(data.listings[0].shop);
        } else if (profile.shopName && profile.shopSlug) {
          // Use profile shop info if no listings yet
          setShop({
            id: "",
            shopName: profile.shopName,
            shopSlug: profile.shopSlug,
            shopBio: null,
            shopAvatarUrl: null,
            bannerUrl: null,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setListingsLoading(false);
    }
  }, [profile, sortBy]);

  useEffect(() => {
    if (profile) {
      fetchListings();
    }
  }, [profile, fetchListings]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!user || !profile?.userId) return;

    setFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${profile.userId}/follow`, { method });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (err) {
      console.error("Error following:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Loading state with artistic skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7]">
        {/* Hero Skeleton */}
        <div className="relative h-[50vh] min-h-[400px] bg-gradient-to-br from-stone-200 to-stone-100 animate-pulse">
          <div className="absolute inset-0 bg-stone-100 opacity-30" />
        </div>
        
        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-stone-200" />
              <div className="space-y-3">
                <div className="h-8 w-48 bg-stone-200 rounded" />
                <div className="h-4 w-32 bg-stone-200 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-stone-100 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (error === "not_found" || !profile) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-stone-300">palette</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-3">Atölye Bulunamadı</h1>
          <p className="text-stone-600 mb-8 leading-relaxed">
            Aradığınız sanatçı atölyesi bulunamadı veya artık mevcut değil.
          </p>
          <Link
            href="/kesfet"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">explore</span>
            Sanatçıları Keşfet
          </Link>
        </div>
      </div>
    );
  }

  if (error === "not_artist") {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-amber-400">person</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-3">Sanatsever Profili</h1>
          <p className="text-stone-600 mb-8 leading-relaxed">
            Bu kullanıcı henüz bir sanatçı değil. Profilini görüntülemek için aşağıdaki butona tıklayın.
          </p>
          <Link
            href={`/sanatsever/${username}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">person</span>
            Profili Görüntüle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Artistic Hero Section */}
      <div className="relative h-[55vh] min-h-[450px] overflow-hidden">
        {/* Background with artistic pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700">
          {/* Artistic dot pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
          
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-stone-900/50 to-transparent" />
        </div>

        {/* Banner Image if available */}
        {profile.bannerUrl && (
          <Image
            src={profile.bannerUrl}
            alt={`${profile.displayName} Atölyesi`}
            fill
            className="object-cover opacity-40"
            priority
            unoptimized={profile.bannerUrl.includes('supabase.co')}
          />
        )}

        {/* Hero Content */}
        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Artist Avatar */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                      unoptimized={profile.avatarUrl.includes('supabase.co')}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                      <span className="text-5xl md:text-6xl font-serif font-bold text-amber-700">
                        {profile.displayName[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Artist Badge */}
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-stone-900">
                  <span className="material-symbols-outlined text-white text-2xl">palette</span>
                </div>
              </div>

              {/* Artist Info */}
              <div className="text-center md:text-left text-white flex-1 pb-2">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
                    {profile.displayName}
                  </h1>
                </div>
                <p className="text-white/70 text-lg mb-1">@{profile.username}</p>
                {profile.location && (
                  <p className="text-white/60 flex items-center justify-center md:justify-start gap-1">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    {profile.location}
                  </p>
                )}
                <p className="text-amber-300/80 text-sm mt-2">
                  {formatDate(profile.memberSince)} tarihinden beri üye
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleFollow}
                  disabled={followLoading || !user || profile.userId === user?.id}
                  className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                    isFollowing
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  } disabled:opacity-50`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isFollowing ? "person_remove" : "person_add"}
                  </span>
                  {isFollowing ? "Takibi Bırak" : "Takip Et"}
                </button>
                <Link
                  href={`/sanatsever/${profile.username}`}
                  className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                  title="Profili Görüntüle"
                >
                  <span className="material-symbols-outlined text-xl">person</span>
                </Link>
                {profile.instagramHandle && (
                  <a
                    href={`https://instagram.com/${profile.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                    title="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Artist Bio Section */}
        {profile.bio && (
          <div className="mb-12 max-w-3xl mx-auto text-center">
            <div className="relative inline-block mb-4">
              <span className="material-symbols-outlined text-4xl text-stone-300">format_quote</span>
            </div>
            <p className="text-lg md:text-xl text-stone-600 leading-relaxed italic font-serif">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Section Header with Decorative Elements */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-stone-300" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-800">
              Eserler
            </h2>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-stone-300" />
            <span className="text-stone-400 text-lg">({listings.length})</span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="text-sm text-stone-500">Sırala:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-stone-200 rounded-full text-stone-700 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              <option value="newest">En Yeni</option>
              <option value="price_asc">Fiyat (Düşük)</option>
              <option value="price_desc">Fiyat (Yüksek)</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[4/5] bg-stone-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-4 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-stone-300">brush</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-800 mb-3">
              Henüz Eser Yok
            </h3>
            <p className="text-stone-500 max-w-md mx-auto">
              {profile.displayName} henüz atölyesine eser eklemedi. 
              Takip ederek yeni eserlerden haberdar olabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing, index) => (
              <Link
                key={listing.id}
                href={`/urun/${listing.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                  {listing.thumbnail ? (
                    <Image
                      src={listing.thumbnail}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized={listing.thumbnail.includes('supabase.co')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
                      <span className="material-symbols-outlined text-6xl text-stone-200">image</span>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-white font-medium bg-amber-500 px-3 py-1 rounded-full text-sm">
                        Görüntüle
                      </span>
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <span className="material-symbols-outlined text-lg">favorite</span>
                        {listing.favoriteCount}
                      </div>
                    </div>
                  </div>

                  {/* Listing Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-stone-700 text-xs font-medium rounded-full">
                      {listing.listingType === "MADE_BY_SELLER" ? "El Yapımı" :
                       listing.listingType === "VINTAGE" ? "Vintage" :
                       listing.listingType === "DESIGNED_BY_SELLER" ? "Tasarım" : "Eser"}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium text-stone-800 line-clamp-2 group-hover:text-amber-600 transition-colors mb-2">
                    {listing.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-stone-900">
                      {(listing.basePriceMinor / 100).toLocaleString("tr-TR")} ₺
                    </p>
                    {listing.baseQuantity <= 1 && (
                      <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
                        Son Parça
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-stone-100">
            <span className="material-symbols-outlined text-4xl text-amber-500 mb-4">mail</span>
            <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">
              Sanatçıyla İletişime Geç
            </h3>
            <p className="text-stone-500 mb-4 max-w-sm">
              Özel sipariş veya işbirliği için {profile.displayName} ile mesajlaşın.
            </p>
            <Link
              href={`/mesajlar?user=${profile.username}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chat</span>
              Mesaj Gönder
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Footer Pattern */}
      <div className="h-16 bg-gradient-to-r from-stone-100 via-amber-50 to-stone-100 opacity-50" />
    </div>
  );
}

