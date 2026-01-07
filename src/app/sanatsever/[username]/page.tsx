"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProfileHero from "@/components/ui/ProfileHero";

interface ProfileData {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  location: string | null;
  isArtist: boolean;
  memberSince: string;
  stats: {
    favorites: number;
    following: number;
    followers: number;
    reviews: number;
  };
  badges: Array<{
    name: string;
    icon: string;
    color: string;
    description: string;
  }>;
}

// Format date in Turkish
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function SanatseverPage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profiles/${username}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("not_found");
          } else {
            setError("error");
          }
          return;
        }
        const data = await res.json();
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

  // Loading skeleton - matches fixed banner layout
  if (loading) {
    return (
      <>
        {/* Fixed Banner Skeleton */}
        <div 
          className="fixed top-0 left-0 right-0 z-0"
          style={{ height: "clamp(280px, 45vh, 400px)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse" />
        </div>

        {/* Spacer */}
        <div 
          className="w-full"
          style={{ height: "clamp(280px, 45vh, 400px)" }}
        />

        {/* Content Skeleton */}
        <div className="relative z-10 bg-surface-white">
          {/* Profile Header Skeleton */}
          <div className="bg-surface-white border-b border-border-subtle">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative -mt-16 md:-mt-20 pb-6">
                <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                  {/* Avatar Skeleton */}
                  <div className="shrink-0 self-center md:self-auto">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gray-200 ring-4 ring-surface-white shadow-xl animate-pulse" />
                  </div>
                  {/* Info Skeleton */}
                  <div className="flex-grow pb-2 space-y-3 text-center md:text-left">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto md:mx-0" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto md:mx-0" />
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto md:mx-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="bg-surface-white border-b border-border-subtle">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-center gap-8 md:gap-12">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content Skeleton */}
        <div className="relative z-10 bg-background-ivory py-8">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="bg-surface-white rounded-xl border border-border-subtle p-6 h-40 animate-pulse" />
                <div className="bg-surface-white rounded-xl border border-border-subtle p-6 h-48 animate-pulse" />
              </div>
              <div className="lg:col-span-2">
                <div className="bg-surface-white rounded-xl border border-border-subtle p-6 h-64 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state - Not found
  if (error === "not_found" || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">person_off</span>
        <h1 className="text-2xl font-bold text-text-charcoal mb-2">Profil Bulunamadı</h1>
        <p className="text-text-secondary mb-6">Bu kullanıcı adına sahip bir profil yok.</p>
        <Link href="/" className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  // Error state - Generic
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
        <h1 className="text-2xl font-bold text-text-charcoal mb-2">Bir Hata Oluştu</h1>
        <p className="text-text-secondary mb-6">Profil yüklenirken bir sorun oluştu.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Profile Hero - Fixed banner with scroll-under content */}
      <ProfileHero
        displayName={profile.displayName}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        bannerUrl={profile.bannerUrl}
        bio={profile.bio}
        location={profile.location}
        memberSince={formatDate(profile.memberSince)}
        profileType={profile.isArtist ? "artist" : "buyer"}
        isVerified={false}
        stats={{
          favorites: profile.stats.favorites,
          following: profile.stats.following,
          followers: profile.stats.followers,
          reviews: profile.stats.reviews,
        }}
      />

      {/* Page Content - Scrollable, continues from ProfileHero */}
      <div className="relative z-10 bg-background-ivory">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Bio */}
            <div className="bg-surface-white rounded-xl border border-border-subtle p-6">
              <h3 className="font-semibold text-text-charcoal mb-3">Hakkında</h3>
              <p className="text-text-secondary leading-relaxed">
                {profile.bio || "Sanat tutkunu."}
              </p>
            </div>

            {/* Badges */}
            {profile.badges.length > 0 && (
              <div className="bg-surface-white rounded-xl border border-border-subtle p-6">
                <h3 className="font-semibold text-text-charcoal mb-4">Rozetler</h3>
                <div className="grid grid-cols-2 gap-3">
                  {profile.badges.map((badge) => (
                    <div 
                      key={badge.name}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background-ivory hover:bg-primary/5 transition-colors cursor-pointer group"
                      title={badge.description}
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${badge.color}20` }}
                      >
                        <span 
                          className="material-symbols-outlined"
                          style={{ color: badge.color }}
                        >
                          {badge.icon}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text-charcoal text-sm truncate group-hover:text-primary transition-colors">
                          {badge.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Artist Shop Link */}
            {profile.isArtist && (
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">storefront</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-charcoal">Sanatçı Dükkanı</h3>
                    <p className="text-sm text-text-secondary">Eserlerini keşfet</p>
                  </div>
                </div>
                <Link 
                  href={`/sanatci/${profile.username}`}
                  className="block w-full text-center px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
                >
                  Dükkanı Ziyaret Et
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-surface-white rounded-xl border border-border-subtle mb-6">
              <div className="flex border-b border-border-subtle">
                <button className="flex-1 py-4 text-center font-medium text-primary border-b-2 border-primary">
                  Aktivite
                </button>
                <button className="flex-1 py-4 text-center font-medium text-text-secondary hover:text-text-charcoal transition-colors">
                  Favoriler
                </button>
                <button className="flex-1 py-4 text-center font-medium text-text-secondary hover:text-text-charcoal transition-colors">
                  Yorumlar
                </button>
              </div>
            </div>

            {/* Empty Activity State */}
            <div className="bg-surface-white rounded-xl border border-border-subtle p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-border-subtle mb-4">
                history
              </span>
              <p className="text-text-secondary">Henüz aktivite yok</p>
              <p className="text-sm text-text-secondary/70 mt-2">
                Favoriler, yorumlar ve diğer aktiviteler burada görünecek.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
