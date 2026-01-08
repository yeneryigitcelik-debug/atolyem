"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProfileHero from "@/components/ui/ProfileHero";

interface ProfileData {
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  location: string | null;
  isArtist: boolean;
  memberSince: string;
  showFavorites: boolean;
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

interface ProfileComment {
  id: string;
  body: string;
  createdAt: string;
  author: {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    username: string | null;
  };
}

interface FavoriteItem {
  listingId: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    basePriceMinor: number;
    currency: string;
    shop: {
      id: string;
      shopName: string;
      shopSlug: string;
    };
    thumbnail: string | null;
  };
  favoritedAt: string;
}

interface FollowUser {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  followedAt: string;
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

type TabType = "activity" | "favorites" | "followers" | "following" | "comments";

export default function SanatseverPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user, profile: authProfile } = useAuth();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<TabType>("activity");
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentsNextCursor, setCommentsNextCursor] = useState<string | null>(null);
  const [commentsHasMore, setCommentsHasMore] = useState(false);

  // Check if this is the current user's own profile
  const isOwnProfile = authProfile?.username === username;

  // Fetch profile
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
        setProfile({
          ...data.profile,
          userId: data.profile.userId,
          showFavorites: data.profile.showFavorites ?? true,
        });
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

  // Check follow status
  useEffect(() => {
    async function checkFollowStatus() {
      if (!user || !profile?.userId || isOwnProfile) return;
      
      try {
        const res = await fetch(`/api/users/${profile.userId}/follow`);
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    }

    if (profile?.userId) {
      checkFollowStatus();
    }
  }, [user, profile?.userId, isOwnProfile]);

  // Handle follow/unfollow
  const handleFollow = useCallback(async () => {
    if (!user) {
      router.push("/hesap");
      return;
    }
    
    if (!profile?.userId || isOwnProfile) return;

    setIsFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${profile.userId}/follow`, { method });
      const data = await res.json();
      
      if (res.ok) {
        setIsFollowing(data.isFollowing);
        // Update follower count in profile
        setProfile((prev) => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers + (data.isFollowing ? 1 : -1),
          },
        } : null);
      }
    } catch (err) {
      console.error("Error following/unfollowing:", err);
    } finally {
      setIsFollowLoading(false);
    }
  }, [user, profile?.userId, isOwnProfile, isFollowing, router]);

  // Fetch favorites when tab is selected
  const fetchFavorites = useCallback(async () => {
    if (!profile?.userId) return;
    
    setFavoritesLoading(true);
    try {
      const res = await fetch(`/api/users/${profile.userId}/favorites?limit=20`);
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setFavoritesLoading(false);
    }
  }, [profile?.userId]);

  // Fetch followers
  const fetchFollowers = useCallback(async () => {
    if (!profile?.userId) return;
    
    setFollowersLoading(true);
    try {
      const res = await fetch(`/api/users/${profile.userId}/followers?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setFollowers(data.followers || []);
      }
    } catch (err) {
      console.error("Error fetching followers:", err);
    } finally {
      setFollowersLoading(false);
    }
  }, [profile?.userId]);

  // Fetch following
  const fetchFollowing = useCallback(async () => {
    if (!profile?.userId) return;
    
    setFollowingLoading(true);
    try {
      const res = await fetch(`/api/users/${profile.userId}/following?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following || []);
      }
    } catch (err) {
      console.error("Error fetching following:", err);
    } finally {
      setFollowingLoading(false);
    }
  }, [profile?.userId]);

  // Fetch comments
  const fetchComments = useCallback(async (cursor?: string) => {
    if (!profile?.userId) return;
    
    setCommentsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (cursor) params.set("cursor", cursor);
      
      const res = await fetch(`/api/users/${profile.userId}/comments?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (cursor) {
          setComments((prev) => [...prev, ...(data.comments || [])]);
        } else {
          setComments(data.comments || []);
        }
        setCommentsNextCursor(data.nextCursor);
        setCommentsHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, [profile?.userId]);

  // Handle comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile?.userId || !commentText.trim()) return;

    setCommentSubmitting(true);
    try {
      const res = await fetch(`/api/users/${profile.userId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentText.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [data.comment, ...prev]);
        setCommentText("");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Handle comment delete
  const handleCommentDelete = async (commentId: string) => {
    if (!profile?.userId) return;
    
    try {
      const res = await fetch(`/api/users/${profile.userId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  // Format relative time for comments
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Az önce";
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return formatDate(dateString);
  };

  // Fetch tab data when tab changes
  useEffect(() => {
    if (!profile?.userId) return;
    
    if (activeTab === "favorites" && favorites.length === 0) {
      fetchFavorites();
    } else if (activeTab === "followers" && followers.length === 0) {
      fetchFollowers();
    } else if (activeTab === "following" && following.length === 0) {
      fetchFollowing();
    } else if (activeTab === "comments" && comments.length === 0) {
      fetchComments();
    }
  }, [activeTab, profile?.userId, favorites.length, followers.length, following.length, comments.length, fetchFavorites, fetchFollowers, fetchFollowing, fetchComments]);

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
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        isFollowLoading={isFollowLoading}
        onFollow={handleFollow}
        onMessage={() => router.push(`/mesajlar?user=${profile.username}`)}
        onShare={() => {
          if (navigator.share) {
            navigator.share({
              title: `${profile.displayName} | Atölyem`,
              url: window.location.href,
            });
          } else {
            navigator.clipboard.writeText(window.location.href);
          }
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
                  href={`/sanatsever/${profile.username}`}
                  className="block w-full text-center px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
                >
                  Profili Görüntüle
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-surface-white rounded-xl border border-border-subtle mb-6">
              <div className="flex border-b border-border-subtle">
                <button 
                  onClick={() => setActiveTab("activity")}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    activeTab === "activity" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-text-secondary hover:text-text-charcoal"
                  }`}
                >
                  Aktivite
                </button>
                <button 
                  onClick={() => setActiveTab("favorites")}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    activeTab === "favorites" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-text-secondary hover:text-text-charcoal"
                  }`}
                >
                  Favoriler
                  {profile.stats.favorites > 0 && (
                    <span className="ml-1 text-xs">({profile.stats.favorites})</span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab("followers")}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    activeTab === "followers" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-text-secondary hover:text-text-charcoal"
                  }`}
                >
                  Takipçiler
                  <span className="ml-1 text-xs">({profile.stats.followers})</span>
                </button>
                <button 
                  onClick={() => setActiveTab("following")}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    activeTab === "following" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-text-secondary hover:text-text-charcoal"
                  }`}
                >
                  Takip
                  <span className="ml-1 text-xs">({profile.stats.following})</span>
                </button>
                <button 
                  onClick={() => setActiveTab("comments")}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    activeTab === "comments" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-text-secondary hover:text-text-charcoal"
                  }`}
                >
                  Yorumlar
                </button>
              </div>
            </div>

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="bg-surface-white rounded-xl border border-border-subtle p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-border-subtle mb-4">
                  history
                </span>
                <p className="text-text-secondary">Henüz aktivite yok</p>
                <p className="text-sm text-text-secondary/70 mt-2">
                  Favoriler, yorumlar ve diğer aktiviteler burada görünecek.
                </p>
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              <div className="bg-surface-white rounded-xl border border-border-subtle">
                {favoritesLoading ? (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Favoriler yükleniyor...</p>
                  </div>
                ) : !profile.showFavorites && !isOwnProfile ? (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-border-subtle mb-4">lock</span>
                    <p className="text-text-secondary">Bu kullanıcı favorilerini gizli tutmayı tercih etti</p>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-border-subtle mb-4">
                      favorite_border
                    </span>
                    <p className="text-text-secondary">Henüz favori eklenmemiş</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                    {favorites.map((fav) => (
                      <Link
                        key={fav.listingId}
                        href={`/urun/${fav.listing.slug}`}
                        className="group bg-background-ivory rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-square relative bg-gray-100">
                          {fav.listing.thumbnail ? (
                            <Image
                              src={fav.listing.thumbnail}
                              alt={fav.listing.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-text-charcoal text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {fav.listing.title}
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            {(fav.listing.basePriceMinor / 100).toLocaleString("tr-TR")} ₺
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Followers Tab */}
            {activeTab === "followers" && (
              <div className="bg-surface-white rounded-xl border border-border-subtle">
                {followersLoading ? (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Takipçiler yükleniyor...</p>
                  </div>
                ) : followers.length === 0 ? (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-border-subtle mb-4">
                      group
                    </span>
                    <p className="text-text-secondary">Henüz takipçi yok</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-subtle">
                    {followers.map((follower) => (
                      <Link
                        key={follower.userId}
                        href={`/sanatsever/${follower.username}`}
                        className="flex items-center gap-4 p-4 hover:bg-background-ivory transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          {follower.avatarUrl ? (
                            <Image
                              src={follower.avatarUrl}
                              alt={follower.displayName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="material-symbols-outlined text-primary">person</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-medium text-text-charcoal truncate">{follower.displayName}</p>
                          <p className="text-sm text-text-secondary">@{follower.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Following Tab */}
            {activeTab === "following" && (
              <div className="bg-surface-white rounded-xl border border-border-subtle">
                {followingLoading ? (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Takip edilenler yükleniyor...</p>
                  </div>
                ) : following.length === 0 ? (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-border-subtle mb-4">
                      person_add
                    </span>
                    <p className="text-text-secondary">Henüz kimse takip edilmiyor</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-subtle">
                    {following.map((followed) => (
                      <Link
                        key={followed.userId}
                        href={`/sanatsever/${followed.username}`}
                        className="flex items-center gap-4 p-4 hover:bg-background-ivory transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          {followed.avatarUrl ? (
                            <Image
                              src={followed.avatarUrl}
                              alt={followed.displayName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="material-symbols-outlined text-primary">person</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-medium text-text-charcoal truncate">{followed.displayName}</p>
                          <p className="text-sm text-text-secondary">@{followed.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div className="space-y-4">
                {/* Comment Form - Show based on user state */}
                {isOwnProfile ? (
                  // Own profile - show info message
                  <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 text-center">
                    <span className="material-symbols-outlined text-2xl text-primary mb-2">person</span>
                    <p className="text-text-charcoal font-medium">Bu sizin profiliniz</p>
                    <p className="text-text-secondary text-sm mt-1">Diğer kullanıcılar burada size yorum bırakabilir.</p>
                  </div>
                ) : user ? (
                  // Logged in and viewing other's profile - show comment form
                  <div className="bg-surface-white rounded-xl border border-border-subtle p-4">
                    <form onSubmit={handleCommentSubmit}>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          {authProfile?.avatarUrl ? (
                            <Image
                              src={authProfile.avatarUrl}
                              alt={authProfile.displayName || ""}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="material-symbols-outlined text-primary text-sm">person</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={`${profile.displayName} hakkında bir yorum yazın...`}
                            rows={3}
                            maxLength={1000}
                            className="w-full px-3 py-2 border border-border-subtle rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-text-secondary">{commentText.length}/1000</span>
                            <button
                              type="submit"
                              disabled={!commentText.trim() || commentSubmitting}
                              className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                              {commentSubmitting ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Gönderiliyor...
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-sm">send</span>
                                  Yorum Yap
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                ) : (
                  // Not logged in - show login prompt
                  <div className="bg-surface-white rounded-xl border border-border-subtle p-6 text-center">
                    <span className="material-symbols-outlined text-3xl text-border-subtle mb-2">comment</span>
                    <p className="text-text-secondary mb-3">Yorum yapmak için giriş yapın</p>
                    <Link
                      href="/hesap"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">login</span>
                      Giriş Yap
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="bg-surface-white rounded-xl border border-border-subtle">
                  {commentsLoading && comments.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-text-secondary">Yorumlar yükleniyor...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="p-12 text-center">
                      <span className="material-symbols-outlined text-5xl text-border-subtle mb-4">
                        chat_bubble_outline
                      </span>
                      <p className="text-text-secondary">Henüz yorum yok</p>
                      <p className="text-sm text-text-secondary/70 mt-1">İlk yorumu siz yazın!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border-subtle">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-4">
                          <div className="flex gap-3">
                            <Link
                              href={comment.author.username ? `/sanatsever/${comment.author.username}` : "#"}
                              className="shrink-0"
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                {comment.author.avatarUrl ? (
                                  <Image
                                    src={comment.author.avatarUrl}
                                    alt={comment.author.displayName}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                    <span className="material-symbols-outlined text-primary text-sm">person</span>
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Link
                                    href={comment.author.username ? `/sanatsever/${comment.author.username}` : "#"}
                                    className="font-medium text-text-charcoal hover:text-primary transition-colors truncate"
                                  >
                                    {comment.author.displayName}
                                  </Link>
                                  <span className="text-xs text-text-secondary shrink-0">
                                    {formatRelativeTime(comment.createdAt)}
                                  </span>
                                </div>
                                {/* Delete button for comment author or profile owner */}
                                {user && (comment.author.userId === user.id || profile.userId === user.id) && (
                                  <button
                                    onClick={() => handleCommentDelete(comment.id)}
                                    className="p-1 text-text-secondary hover:text-red-500 transition-colors"
                                    title="Yorumu sil"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                )}
                              </div>
                              <p className="text-text-secondary mt-1 whitespace-pre-wrap break-words">
                                {comment.body}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Load More */}
                      {commentsHasMore && (
                        <div className="p-4 text-center">
                          <button
                            onClick={() => fetchComments(commentsNextCursor || undefined)}
                            disabled={commentsLoading}
                            className="px-4 py-2 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-lg transition-colors disabled:opacity-50"
                          >
                            {commentsLoading ? "Yükleniyor..." : "Daha Fazla Yükle"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
