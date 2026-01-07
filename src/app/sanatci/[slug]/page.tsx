"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ui/ProductCard";
import ProfileHero from "@/components/ui/ProfileHero";
import { useAuth } from "@/contexts/AuthContext";

// Mock artist data - in production this would come from API
const artists: Record<string, { 
  name: string; 
  specialty: string; 
  bio: string; 
  location: string; 
  since: number; 
  instagram?: string; 
  website?: string;
  avatar: string;
  banner: string;
  tagline?: string;
  responseTime?: string;
  lastActive?: string;
  userId?: string;
}> = {
  "sinem-demirtas": { 
    name: "Sinem Demirtaş", 
    specialty: "Ressam", 
    bio: "Renklerin ve fırça darbelerinin dansı, ruhun özgürlüğüdür. Tuvallerimde doğanın ve insanın iç dünyasının buluştuğu anları yakalıyorum.", 
    location: "İstanbul", 
    since: 2018, 
    instagram: "sinemdemirtas.art",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&h=400&fit=crop",
    tagline: "Renklerle dans eden tualler",
    responseTime: "Genelde 1 saat içinde",
    lastActive: "Bugün",
  },
  "mehmet-demir": { 
    name: "Mehmet Demir", 
    specialty: "Seramik", 
    bio: "Toprak ve ateşin dansından doğan formlar yaratıyorum. Her eser benzersiz bir hikaye anlatır.", 
    location: "İzmir", 
    since: 2015, 
    instagram: "mehmetdemir_seramik", 
    website: "mehmetdemir.art",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600&h=400&fit=crop",
    tagline: "Toprağın şarkısı",
    responseTime: "Genelde 24 saat içinde",
    lastActive: "Bugün",
  },
  "ayse-yilmaz": { 
    name: "Ayşe Yılmaz", 
    specialty: "Heykel", 
    bio: "Taşın ve bronzun dilini konuşuyorum. Eserlerim mekana anlam katar.", 
    location: "Ankara", 
    since: 2019,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=1600&h=400&fit=crop",
    tagline: "Formların sessiz anlatısı",
    responseTime: "Genelde birkaç saat içinde",
    lastActive: "Dün",
  },
  "ali-ozturk": { 
    name: "Ali Öztürk", 
    specialty: "Fotoğraf", 
    bio: "Işığı ve anı yakalıyorum. Her fotoğraf bir duyguyu temsil eder.", 
    location: "Bursa", 
    since: 2016, 
    instagram: "aliozturk.photo",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1600&h=400&fit=crop",
    tagline: "Işıkla yazılan hikayeler",
    responseTime: "Genelde birkaç saat içinde",
    lastActive: "Bugün",
  },
  "fatma-celik": { 
    name: "Fatma Çelik", 
    specialty: "Tekstil", 
    bio: "Geleneksel dokuma tekniklerini modern tasarımlarla buluşturuyorum.", 
    location: "Denizli", 
    since: 2017,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&h=400&fit=crop",
    tagline: "İplikten sanata",
    responseTime: "Genelde 2-3 gün içinde",
    lastActive: "3 gün önce",
  },
  "emre-arslan": { 
    name: "Emre Arslan", 
    specialty: "Cam Sanatı", 
    bio: "Cam ile ışığın büyülü dansını yaratıyorum.", 
    location: "Eskişehir", 
    since: 2020, 
    website: "emrearslan.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=1600&h=400&fit=crop",
    tagline: "Cam ve ışığın dansı",
    responseTime: "Genelde 24 saat içinde",
    lastActive: "Bugün",
  },
};

const defaultArtist = {
  name: "Sanatçı",
  specialty: "Sanat",
  bio: "Sanatçı hakkında bilgi.",
  location: "Türkiye",
  since: 2020,
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
  banner: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&h=400&fit=crop",
  tagline: "Sanat tutkunu",
  responseTime: "Değişken",
  lastActive: "Bilinmiyor",
};

const mockProducts = [
  { title: "Soyut Kompozisyon", artist: "Sinem Demirtaş", price: 3500, slug: "soyut-kompozisyon", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Mavi Harmoni", artist: "Sinem Demirtaş", price: 2800, slug: "mavi-harmoni", image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop", badge: "Limited" },
  { title: "Doğa Esintisi", artist: "Sinem Demirtaş", price: 4200, slug: "doga-esintisi", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop", badge: "Orijinal" },
  { title: "Şehir Manzarası", artist: "Sinem Demirtaş", price: 1900, slug: "sehir-manzarasi", image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=400&h=400&fit=crop", badge: "Orijinal" },
];

const mockCollections = [
  { name: "Doğa Serisi", count: 8, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&h=200&fit=crop" },
  { name: "Şehir Yaşamı", count: 5, image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=300&h=200&fit=crop" },
];

const mockReviews = [
  { id: "1", buyerName: "Ayşe Y.", buyerInitials: "AY", rating: 5, text: "Muhteşem bir eser aldım. Paketleme çok özenli, iletişim mükemmeldi. Kesinlikle tekrar alışveriş yapacağım.", date: "2 hafta önce", verified: true },
  { id: "2", buyerName: "Mehmet K.", buyerInitials: "MK", rating: 5, text: "Beklentilerimin çok üzerinde bir kalite. Sanatçının işçiliği gerçekten etkileyici.", date: "1 ay önce", verified: false },
  { id: "3", buyerName: "Zeynep A.", buyerInitials: "ZA", rating: 4, text: "Ürün çok güzel, sadece kargo biraz gecikti ama değdi.", date: "1 ay önce", verified: true },
  { id: "4", buyerName: "Ali R.", buyerInitials: "AR", rating: 5, text: "Hediye olarak aldım, karşı taraf çok beğendi. Teşekkürler!", date: "2 ay önce", verified: false },
];

type TabType = "works" | "collections" | "about" | "reviews";

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

export default function SanatciPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const artist = artists[slug] || defaultArtist;
  const { user, profile: authProfile } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("works");
  
  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  // Comments state (for reviews/about)
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Check if this is the current user's own profile
  const isOwnProfile = authProfile?.username === slug;

  // Handle follow/unfollow (mock for now, would connect to real API)
  const handleFollow = useCallback(async () => {
    if (!user) {
      router.push("/hesap");
      return;
    }
    
    if (isOwnProfile) return;

    setIsFollowLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Error following:", err);
    } finally {
      setIsFollowLoading(false);
    }
  }, [user, isOwnProfile, isFollowing, router]);

  // Fetch comments for about section
  const fetchComments = useCallback(async () => {
    if (!artist.userId) return;
    
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/users/${artist.userId}/comments?limit=20`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, [artist.userId]);

  // Handle comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !artist.userId || !commentText.trim()) return;

    setCommentSubmitting(true);
    try {
      const res = await fetch(`/api/users/${artist.userId}/comments`, {
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

  // Fetch comments when about tab is selected
  useEffect(() => {
    if (activeTab === "about" && artist.userId && comments.length === 0) {
      fetchComments();
    }
  }, [activeTab, artist.userId, comments.length, fetchComments]);

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
    return date.toLocaleDateString("tr-TR");
  };

  return (
    <>
      {/* Profile Hero - Fixed banner with scroll-under content */}
      <ProfileHero
        displayName={artist.name}
        username={slug}
        avatarUrl={artist.avatar}
        bannerUrl={artist.banner}
        bio={artist.bio}
        location={artist.location}
        memberSince={`${artist.since}`}
        tagline={artist.tagline}
        profileType="artist"
        isVerified={true}
        specialty={artist.specialty}
        responseTime={artist.responseTime}
        lastActive={artist.lastActive}
        instagramHandle={artist.instagram}
        websiteUrl={artist.website}
        stats={{
          works: mockProducts.length,
          followers: 152,
          following: 48,
          rating: 4.9,
        }}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        isFollowLoading={isFollowLoading}
        onFollow={handleFollow}
        onMessage={() => router.push(`/mesajlar?user=${slug}`)}
        onShare={() => {
          if (navigator.share) {
            navigator.share({
              title: `${artist.name} | Atölyem`,
              url: window.location.href,
            });
          } else {
            navigator.clipboard.writeText(window.location.href);
          }
        }}
      />

      {/* Page Content - Scrollable, continues from ProfileHero */}
      <div className="relative z-10 bg-background-ivory">
        {/* Tabs */}
        <div className="bg-surface-white border-b border-border-subtle sticky top-20 z-40">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab("works")}
                className={`py-4 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === "works"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-charcoal"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                Eserler
              </button>
              <button 
                onClick={() => setActiveTab("collections")}
                className={`py-4 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === "collections"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-charcoal"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">collections</span>
                Koleksiyonlar
              </button>
              <button 
                onClick={() => setActiveTab("about")}
                className={`py-4 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === "about"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-charcoal"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">info</span>
                Hakkında
              </button>
              <button 
                onClick={() => setActiveTab("reviews")}
                className={`py-4 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === "reviews"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-charcoal"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">star</span>
                Değerlendirmeler
              </button>
            </div>
          </div>
        </div>

        {/* Works Tab */}
        {activeTab === "works" && (
          <>
            {/* Collections Preview */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h3 className="text-lg font-semibold text-text-charcoal mb-4">Koleksiyonlar</h3>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {mockCollections.map((collection) => (
                  <button 
                    key={collection.name}
                    onClick={() => setActiveTab("collections")}
                    className="shrink-0 group text-left"
                  >
                    <div className="w-40 h-28 rounded-lg overflow-hidden relative">
                      <div 
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                        style={{ backgroundImage: `url('${collection.image}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white font-medium text-sm">{collection.name}</p>
                        <p className="text-white/70 text-xs">{collection.count} eser</p>
                      </div>
                    </div>
                  </button>
                ))}
                <button 
                  onClick={() => setActiveTab("collections")}
                  className="shrink-0 w-40 h-28 rounded-lg border-2 border-dashed border-border-subtle flex items-center justify-center hover:border-primary transition-colors group"
                >
                  <span className="text-text-secondary group-hover:text-primary transition-colors text-sm">Tümünü Gör</span>
                </button>
              </div>
            </div>

            {/* Products */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-charcoal">Eserler</h2>
                <div className="flex items-center gap-2">
                  <select className="px-3 py-2 border border-border-subtle rounded-md text-sm bg-surface-white focus:outline-none focus:border-primary">
                    <option>En Yeni</option>
                    <option>Fiyat: Düşükten Yükseğe</option>
                    <option>Fiyat: Yüksekten Düşüğe</option>
                    <option>En Popüler</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockProducts.map((product) => (
                  <ProductCard key={product.slug} {...product} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Collections Tab */}
        {activeTab === "collections" && (
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-text-charcoal mb-6">Koleksiyonlar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCollections.map((collection) => (
                <div 
                  key={collection.name}
                  className="bg-surface-white rounded-xl overflow-hidden border border-border-subtle hover:shadow-lg transition-shadow group cursor-pointer"
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{collection.name}</h3>
                      <p className="text-white/80 text-sm">{collection.count} eser</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty state */}
              {mockCollections.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-border-subtle mb-4">collections</span>
                  <p className="text-text-secondary">Henüz koleksiyon oluşturulmamış</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: About Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio Section */}
                <div className="bg-surface-white rounded-xl border border-border-subtle p-6">
                  <h2 className="text-xl font-bold text-text-charcoal mb-4">Sanatçı Hakkında</h2>
                  <p className="text-text-secondary leading-relaxed">{artist.bio}</p>
                  
                  {/* Social Links */}
                  <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border-subtle">
                    {artist.instagram && (
                      <a 
                        href={`https://instagram.com/${artist.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-background-ivory hover:bg-primary/10 text-text-secondary hover:text-primary rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        @{artist.instagram}
                      </a>
                    )}
                    {artist.website && (
                      <a 
                        href={`https://${artist.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-background-ivory hover:bg-primary/10 text-text-secondary hover:text-primary rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">language</span>
                        {artist.website}
                      </a>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="bg-surface-white rounded-xl border border-border-subtle p-6">
                  <h2 className="text-xl font-bold text-text-charcoal mb-4">Yorumlar</h2>
                  
                  {/* Comment Form */}
                  {user ? (
                    <form onSubmit={handleCommentSubmit} className="mb-6">
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
                            placeholder={`${artist.name} hakkında bir yorum yazın...`}
                            rows={3}
                            maxLength={1000}
                            className="w-full px-3 py-2 border border-border-subtle rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-text-secondary">{commentText.length}/1000</span>
                            <button
                              type="submit"
                              disabled={!commentText.trim() || commentSubmitting}
                              className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-medium rounded-lg transition-colors"
                            >
                              {commentSubmitting ? "Gönderiliyor..." : "Yorum Yap"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="mb-6 p-4 bg-background-ivory rounded-lg text-center">
                      <p className="text-text-secondary mb-2">Yorum yapmak için giriş yapın</p>
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
                  {commentsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-text-secondary">Yorumlar yükleniyor...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-4xl text-border-subtle mb-2">chat_bubble_outline</span>
                      <p className="text-text-secondary">Henüz yorum yok</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
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
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                href={comment.author.username ? `/sanatsever/${comment.author.username}` : "#"}
                                className="font-medium text-text-charcoal hover:text-primary transition-colors"
                              >
                                {comment.author.displayName}
                              </Link>
                              <span className="text-xs text-text-secondary">{formatRelativeTime(comment.createdAt)}</span>
                            </div>
                            <p className="text-text-secondary">{comment.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Info Sidebar */}
              <div className="space-y-6">
                {/* Quick Info */}
                <div className="bg-surface-white rounded-xl border border-border-subtle p-6">
                  <h3 className="font-semibold text-text-charcoal mb-4">Hızlı Bilgiler</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">palette</span>
                      <div>
                        <p className="text-xs text-text-secondary">Uzmanlık</p>
                        <p className="font-medium text-text-charcoal">{artist.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">location_on</span>
                      <div>
                        <p className="text-xs text-text-secondary">Konum</p>
                        <p className="font-medium text-text-charcoal">{artist.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">calendar_today</span>
                      <div>
                        <p className="text-xs text-text-secondary">Üye</p>
                        <p className="font-medium text-text-charcoal">{artist.since}&apos;den beri</p>
                      </div>
                    </div>
                    {artist.responseTime && (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-600">schedule</span>
                        <div>
                          <p className="text-xs text-text-secondary">Yanıt Süresi</p>
                          <p className="font-medium text-green-600">{artist.responseTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact CTA */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-6">
                  <h3 className="font-semibold text-text-charcoal mb-2">Sanatçıyla İletişime Geç</h3>
                  <p className="text-sm text-text-secondary mb-4">Özel sipariş veya sorularınız için mesaj gönderin</p>
                  <button 
                    onClick={() => router.push(`/mesajlar?user=${slug}`)}
                    className="w-full px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    Mesaj Gönder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <section className="bg-surface-warm py-12">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-text-charcoal">Değerlendirmeler</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-primary">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[20px]">star</span>
                    ))}
                  </div>
                  <span className="font-bold text-text-charcoal">4.9</span>
                  <span className="text-text-secondary">(47 değerlendirme)</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="bg-surface-white rounded-lg border border-border-subtle p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-background-ivory flex items-center justify-center">
                        <span className="text-lg font-bold text-text-charcoal">{review.buyerInitials}</span>
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-text-charcoal">{review.buyerName}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-primary">
                            {[...Array(review.rating)].map((_, j) => (
                              <span key={j} className="material-symbols-outlined text-[14px]">star</span>
                            ))}
                          </div>
                          <span className="text-xs text-text-secondary">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-text-secondary">{review.text}</p>
                    {review.verified && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
                        <span className="text-text-secondary">Doğrulanmış Alışveriş</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <button className="px-6 py-3 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-lg transition-colors">
                  Tüm Değerlendirmeleri Gör
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Similar Artists */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-text-charcoal mb-8">Benzer Sanatçılar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {Object.entries(artists).slice(0, 6).map(([artistSlug, artistData]) => (
              <Link 
                key={artistSlug}
                href={`/sanatci/${artistSlug}`}
                className="text-center group"
              >
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-border-subtle group-hover:border-primary transition-colors">
                  <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${artistData.avatar}')` }}
                  />
                </div>
                <p className="mt-3 font-medium text-text-charcoal group-hover:text-primary transition-colors text-sm">{artistData.name}</p>
                <p className="text-xs text-text-secondary">{artistData.specialty}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
