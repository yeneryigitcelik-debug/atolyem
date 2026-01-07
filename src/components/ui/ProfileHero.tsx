"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * ProfileHero - Fixed banner with scroll-under content
 * 
 * Layout:
 * - Banner: position fixed, stays in place while scrolling
 * - Content: starts below banner with padding-top
 * - No CLS: fixed heights defined
 */

export interface ProfileHeroProps {
  // Required
  displayName: string;
  username: string;
  avatarUrl: string | null;
  
  // Optional profile data
  bannerUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  memberSince?: string;
  tagline?: string | null;
  
  // Profile type
  profileType: "artist" | "buyer";
  isVerified?: boolean;
  
  // Artist specific
  specialty?: string;
  responseTime?: string;
  lastActive?: string;
  
  // Social links
  instagramHandle?: string | null;
  websiteUrl?: string | null;
  
  // Stats
  stats?: {
    works?: number;
    favorites?: number;
    following?: number;
    followers?: number;
    reviews?: number;
    rating?: number;
  };
  
  // Actions
  onFollow?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
  isFollowing?: boolean;
  isFollowLoading?: boolean;
  isOwnProfile?: boolean;
}

// Banner heights - consistent across the app
const BANNER_HEIGHT = {
  mobile: "45vh",
  desktop: "55vh",
};

// Default fallback images
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop";
const DEFAULT_BANNER_ARTIST = "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&h=900&fit=crop";
const DEFAULT_BANNER_BUYER = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1600&h=900&fit=crop";

export default function ProfileHero({
  displayName,
  username,
  avatarUrl,
  bannerUrl,
  bio,
  location,
  memberSince,
  tagline,
  profileType,
  isVerified = false,
  specialty,
  responseTime,
  lastActive,
  instagramHandle,
  websiteUrl,
  stats,
  onFollow,
  onMessage,
  onShare,
  isFollowing = false,
  isFollowLoading = false,
  isOwnProfile = false,
}: ProfileHeroProps) {
  const isArtist = profileType === "artist";
  const finalAvatarUrl = avatarUrl || DEFAULT_AVATAR;
  const finalBannerUrl = bannerUrl || (isArtist ? DEFAULT_BANNER_ARTIST : DEFAULT_BANNER_BUYER);
  const isOnline = lastActive === "Bugün";
  
  return (
    <>
      {/* ==================== FIXED BANNER ==================== */}
      {/* Fixed position: stays in place while content scrolls */}
      <div 
        className="fixed top-0 left-0 right-0 z-0"
        style={{ height: `clamp(280px, ${BANNER_HEIGHT.mobile}, 400px)` }}
      >
        {/* Banner Image with next/image for optimization */}
        <div className="absolute inset-0">
          <Image
            src={finalBannerUrl}
            alt={`${displayName} profil kapağı`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        
        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* ==================== SPACER ==================== */}
      {/* This creates space for the fixed banner */}
      <div 
        className="w-full"
        style={{ height: `clamp(280px, ${BANNER_HEIGHT.mobile}, 400px)` }}
        aria-hidden="true"
      />

      {/* ==================== PROFILE CONTENT (Scrollable) ==================== */}
      <div className="relative z-10 bg-surface-white">
        {/* Profile Header Card */}
        <div className="bg-surface-white border-b border-border-subtle shadow-sm">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Avatar pulled up into banner area */}
            <div className="relative -mt-16 md:-mt-20 pb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                
                {/* ===== AVATAR ===== */}
                <div className="shrink-0 relative self-center md:self-auto">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden ring-4 ring-surface-white shadow-xl bg-surface-white">
                    <Image
                      src={finalAvatarUrl}
                      alt={displayName}
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Online indicator */}
                  {isArtist && isOnline && (
                    <div 
                      className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full ring-2 ring-white" 
                      title="Aktif"
                    />
                  )}
                </div>

                {/* ===== PROFILE INFO ===== */}
                <div className="flex-grow text-center md:text-left pb-2">
                  {/* Name + Badges Row */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-charcoal">
                      {displayName}
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                      {/* Profile Type Badge */}
                      {isArtist ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-primary-dark text-white">
                          <span className="material-symbols-outlined text-[14px]">palette</span>
                          Sanatçı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-500 to-orange-500 text-white">
                          <span className="material-symbols-outlined text-[14px]">favorite</span>
                          Sanatsever
                        </span>
                      )}
                      {/* Verified Badge */}
                      {isVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-[12px] mr-1">verified</span>
                          Doğrulanmış
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <p className="text-text-secondary mb-2">@{username}</p>

                  {/* Tagline */}
                  {tagline && (
                    <p className="text-text-secondary text-base italic mb-2">{tagline}</p>
                  )}

                  {/* Meta Info Row */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-text-secondary">
                    {specialty && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">palette</span>
                        {specialty}
                      </span>
                    )}
                    {location && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {location}
                      </span>
                    )}
                    {memberSince && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {memberSince}&apos;den beri üye
                      </span>
                    )}
                    {responseTime && (
                      <span className="flex items-center gap-1 text-green-600">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {responseTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* ===== ACTION BUTTONS (Desktop) ===== */}
                {!isOwnProfile && (
                  <div className="hidden md:flex items-center gap-3 shrink-0">
                    <button 
                      onClick={onFollow}
                      disabled={isFollowLoading}
                      className={`px-5 py-2.5 font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${
                        isFollowing 
                          ? "bg-surface-white border border-primary text-primary hover:bg-primary/5"
                          : "bg-primary hover:bg-primary-dark text-white shadow-sm"
                      }`}
                    >
                      {isFollowLoading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">
                            {isFollowing ? "person_remove" : "person_add"}
                          </span>
                          {isFollowing ? "Takipten Çık" : "Takip Et"}
                        </>
                      )}
                    </button>
                    <button 
                      onClick={onMessage}
                      className="px-5 py-2.5 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                      Mesaj
                    </button>
                    <button 
                      onClick={onShare}
                      className="p-2.5 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">share</span>
                    </button>
                  </div>
                )}

                {/* Edit Profile Button (Own Profile) */}
                {isOwnProfile && (
                  <div className="hidden md:flex items-center gap-3 shrink-0">
                    <Link
                      href="/profil-duzenle"
                      className="px-5 py-2.5 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                      Profili Düzenle
                    </Link>
                    <button 
                      onClick={onShare}
                      className="p-2.5 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">share</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ===== ACTION BUTTONS (Mobile) ===== */}
              <div className="flex md:hidden items-center justify-center gap-3 mt-6">
                {!isOwnProfile ? (
                  <>
                    <button 
                      onClick={onFollow}
                      disabled={isFollowLoading}
                      className={`flex-1 px-4 py-2.5 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                        isFollowing 
                          ? "bg-surface-white border border-primary text-primary"
                          : "bg-primary hover:bg-primary-dark text-white"
                      }`}
                    >
                      {isFollowLoading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">
                            {isFollowing ? "person_remove" : "person_add"}
                          </span>
                          {isFollowing ? "Çık" : "Takip Et"}
                        </>
                      )}
                    </button>
                    <button 
                      onClick={onMessage}
                      className="flex-1 px-4 py-2.5 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                      Mesaj
                    </button>
                    <button 
                      onClick={onShare}
                      className="p-2.5 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">share</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/profil-duzenle"
                      className="flex-1 px-4 py-2.5 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                      Düzenle
                    </Link>
                    <button 
                      onClick={onShare}
                      className="p-2.5 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">share</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== BIO SECTION (Artists) ==================== */}
        {isArtist && bio && (
          <div className="bg-surface-warm border-b border-border-subtle">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Bio Text */}
                <div className="flex-grow">
                  <p className="text-text-secondary leading-relaxed italic">&quot;{bio}&quot;</p>
                  
                  {/* Social Links */}
                  {(instagramHandle || websiteUrl) && (
                    <div className="flex items-center gap-4 mt-4">
                      {instagramHandle && (
                        <a 
                          href={`https://instagram.com/${instagramHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          @{instagramHandle}
                        </a>
                      )}
                      {websiteUrl && (
                        <a 
                          href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">language</span>
                          {websiteUrl.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Info Cards */}
                {(responseTime || lastActive) && (
                  <div className="flex flex-wrap gap-3 shrink-0">
                    {responseTime && (
                      <div className="px-4 py-3 bg-surface-white rounded-lg border border-border-subtle">
                        <p className="text-xs text-text-secondary">Yanıt Süresi</p>
                        <p className="font-medium text-text-charcoal text-sm">{responseTime}</p>
                      </div>
                    )}
                    {lastActive && (
                      <div className="px-4 py-3 bg-surface-white rounded-lg border border-border-subtle">
                        <p className="text-xs text-text-secondary">Son Aktiflik</p>
                        <p className="font-medium text-text-charcoal text-sm">{lastActive}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== STATS BAR ==================== */}
        {stats && (
          <div className="bg-surface-white border-b border-border-subtle">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-center gap-6 md:gap-12">
                {stats.works !== undefined && (
                  <div className="text-center cursor-pointer hover:text-primary transition-colors">
                    <p className="text-xl md:text-2xl font-bold text-text-charcoal">{stats.works}</p>
                    <p className="text-sm text-text-secondary">Eser</p>
                  </div>
                )}
                {stats.favorites !== undefined && (
                  <div className="text-center cursor-pointer hover:text-primary transition-colors">
                    <p className="text-xl md:text-2xl font-bold text-text-charcoal">{stats.favorites}</p>
                    <p className="text-sm text-text-secondary">Favori</p>
                  </div>
                )}
                <div className="text-center cursor-pointer hover:text-primary transition-colors">
                  <p className="text-xl md:text-2xl font-bold text-text-charcoal">{stats.followers || 0}</p>
                  <p className="text-sm text-text-secondary">Takipçi</p>
                </div>
                <div className="text-center cursor-pointer hover:text-primary transition-colors">
                  <p className="text-xl md:text-2xl font-bold text-text-charcoal">{stats.following || 0}</p>
                  <p className="text-sm text-text-secondary">Takip</p>
                </div>
                {stats.reviews !== undefined && (
                  <div className="text-center cursor-pointer hover:text-primary transition-colors">
                    <p className="text-xl md:text-2xl font-bold text-text-charcoal">{stats.reviews}</p>
                    <p className="text-sm text-text-secondary">Yorum</p>
                  </div>
                )}
                {stats.rating !== undefined && (
                  <div className="text-center">
                    <p className="text-xl md:text-2xl font-bold text-text-charcoal">{stats.rating}</p>
                    <p className="text-sm text-text-secondary">Puan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Export banner height constant for pages to use for padding
export const PROFILE_BANNER_HEIGHT = {
  mobile: "clamp(280px, 45vh, 400px)",
  desktop: "clamp(280px, 45vh, 400px)",
};
