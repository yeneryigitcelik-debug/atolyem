"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  { name: "Resim", slug: "resim", icon: "brush" },
  { name: "Heykel", slug: "heykel", icon: "view_in_ar" },
  { name: "Seramik", slug: "seramik", icon: "water_drop" },
  { name: "Fotoğraf", slug: "fotograf", icon: "photo_camera" },
  { name: "Tekstil", slug: "tekstil", icon: "checkroom" },
  { name: "Cam Sanatı", slug: "cam-sanati", icon: "wine_bar" },
  { name: "Takı & Aksesuar", slug: "taki-aksesuar", icon: "diamond" },
  { name: "Dijital Sanat", slug: "dijital-sanat", icon: "computer" },
  { name: "El İşi", slug: "el-isi", icon: "back_hand" },
  { name: "Vintage", slug: "vintage", icon: "history" },
];

export default function Header() {
  const { user, profile, isLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setCategoriesOpen(false);
    };
    if (categoriesOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [categoriesOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-white/95 backdrop-blur-sm border-b border-border-subtle transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="flex h-20 items-center justify-between gap-4 sm:gap-8">
          {/* Logo + Categories */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-text-charcoal text-3xl">palette</span>
              <h1 className="text-text-charcoal text-2xl font-bold tracking-tight">Atölyem.net</h1>
            </Link>

            {/* Categories Dropdown - Desktop */}
            <div 
              className="hidden lg:block relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button 
                className="flex items-center gap-1 px-3 py-2 text-text-charcoal hover:text-primary rounded-md hover:bg-background-ivory transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setCategoriesOpen(!categoriesOpen);
                }}
              >
                <span className="material-symbols-outlined text-[20px]">category</span>
                <span className="font-medium">Kategoriler</span>
                <span className={`material-symbols-outlined text-[18px] transition-transform ${categoriesOpen ? "rotate-180" : ""}`}>expand_more</span>
              </button>

              {/* Categories Mega Menu */}
              {categoriesOpen && (
                <div className="absolute left-0 top-full pt-2 z-50">
                  <div className="bg-surface-white rounded-xl border border-border-subtle shadow-xl p-6 min-w-[480px]">
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/kategori/${cat.slug}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-background-ivory transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-primary">{cat.icon}</span>
                          </div>
                          <span className="font-medium text-text-charcoal group-hover:text-primary transition-colors">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border-subtle">
                      <Link 
                        href="/kesfet" 
                        className="flex items-center justify-center gap-2 w-full py-2 text-primary hover:text-primary-dark font-medium transition-colors"
                      >
                        Tüm Kategorileri Gör
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar (Hidden on mobile, visible on tablet+) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-auto">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-border-subtle rounded-md leading-5 bg-surface-white placeholder-text-secondary/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
                placeholder="Sanatçı, eser veya koleksiyon ara..."
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Artist Panel Button - Only show for artists */}
            {profile?.isArtist && (
              <Link
                href="/satici-paneli"
                className="hidden sm:flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Sanatçı Paneli
              </Link>
            )}
            
            {/* Become Artist Button - Only show for non-artists */}
            {user && !profile?.isArtist && (
              <Link
                href="/sanatci-ol"
                className="hidden sm:flex items-center justify-center px-5 py-2.5 border border-primary text-sm font-medium rounded-md text-primary hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Sanatçı Ol
              </Link>
            )}

            {/* Icon Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/favoriler" className="p-2 text-text-charcoal hover:text-primary transition-colors rounded-full hover:bg-background-ivory">
                <span className="material-symbols-outlined">favorite</span>
              </Link>
              <Link href="/sepet" className="p-2 text-text-charcoal hover:text-primary transition-colors rounded-full hover:bg-background-ivory relative">
                <span className="material-symbols-outlined">shopping_bag</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
              </Link>
              
              {/* User Menu */}
              {isLoading ? (
                <div className="p-2">
                  <div className="w-6 h-6 border-2 border-border-subtle border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 text-text-charcoal hover:text-primary transition-colors rounded-full hover:bg-background-ivory"
                  >
                    {profile?.avatarUrl ? (
                      <div 
                        className="w-8 h-8 rounded-full bg-cover bg-center border border-border-subtle"
                        style={{ backgroundImage: `url('${profile.avatarUrl}')` }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">
                          {profile?.displayName?.[0]?.toUpperCase() || user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </button>
                  
                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-surface-white rounded-lg border border-border-subtle shadow-lg z-20 py-2">
                        <div className="px-4 py-3 border-b border-border-subtle">
                          <p className="font-medium text-text-charcoal truncate">
                            {profile?.displayName || user.user_metadata?.full_name || "Kullanıcı"}
                          </p>
                          <p className="text-sm text-text-secondary truncate">{user.email}</p>
                          {profile?.isArtist && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              <span className="material-symbols-outlined text-[12px]">palette</span>
                              Sanatçı
                            </span>
                          )}
                        </div>
                        {profile?.username ? (
                          <Link 
                            href={`/sanatsever/${profile.username}`} 
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-text-charcoal hover:bg-background-ivory transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">person</span>
                            Profilim
                          </Link>
                        ) : (
                          <button
                            onClick={async () => {
                              setUserMenuOpen(false);
                              // Force profile creation and redirect
                              const res = await fetch("/api/me/profile");
                              if (res.ok) {
                                const data = await res.json();
                                if (data.profile?.username) {
                                  window.location.href = `/sanatsever/${data.profile.username}`;
                                }
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-text-charcoal hover:bg-background-ivory transition-colors w-full text-left"
                          >
                            <span className="material-symbols-outlined text-[20px]">person</span>
                            Profilim
                          </button>
                        )}
                        {profile?.isArtist && profile?.username && (
                          <>
                            <Link 
                              href={`/sanatsever/${profile.username}`}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-text-charcoal hover:bg-background-ivory transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">storefront</span>
                              Profilim
                            </Link>
                            <Link 
                              href="/satici-paneli"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-text-charcoal hover:bg-background-ivory transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">dashboard</span>
                              Satıcı Paneli
                            </Link>
                          </>
                        )}
                        <Link 
                          href="/siparislerim"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-text-charcoal hover:bg-background-ivory transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                          Siparişlerim
                        </Link>
                        <Link 
                          href="/mesajlar"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-text-charcoal hover:bg-background-ivory transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">mail</span>
                          Mesajlarım
                        </Link>
                        <Link 
                          href="/favoriler"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-text-charcoal hover:bg-background-ivory transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">favorite</span>
                          Favorilerim
                        </Link>
                        <Link 
                          href="/adreslerim"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-text-charcoal hover:bg-background-ivory transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">location_on</span>
                          Adreslerim
                        </Link>
                        <Link 
                          href="/hesap"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-text-charcoal hover:bg-background-ivory transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">account_circle</span>
                          Hesap
                        </Link>
                        <Link 
                          href="/ayarlar"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-text-charcoal hover:bg-background-ivory transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">settings</span>
                          Ayarlar
                        </Link>
                        <hr className="my-2 border-border-subtle" />
                        <button 
                          onClick={handleSignOut}
                          className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">logout</span>
                          Çıkış Yap
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/hesap" className="p-2 text-text-charcoal hover:text-primary transition-colors rounded-full hover:bg-background-ivory">
                  <span className="material-symbols-outlined">person</span>
                </Link>
              )}
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-text-charcoal hover:text-primary transition-colors rounded-full hover:bg-background-ivory"
              >
                <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-6 pb-3 -mt-2">
          <Link href="/kesfet" className="text-sm font-medium text-text-charcoal hover:text-primary transition-colors">
            Keşfet
          </Link>
          <Link href="/koleksiyonlar" className="text-sm font-medium text-text-charcoal hover:text-primary transition-colors">
            Koleksiyonlar
          </Link>
          <Link href="/sanatcilar" className="text-sm font-medium text-text-charcoal hover:text-primary transition-colors">
            Sanatçılar
          </Link>
          <Link href="/akademi" className="text-sm font-medium text-text-charcoal hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">school</span>
            Akademi
          </Link>
          <Link href="/blog" className="text-sm font-medium text-text-charcoal hover:text-primary transition-colors">
            Blog
          </Link>
          <Link href="/hediyelik" className="text-sm font-medium text-text-charcoal hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">redeem</span>
            Hediyelik
          </Link>
        </nav>

        {/* Mobile Search (Visible only on mobile) */}
        <div className="md:hidden pb-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-secondary text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-border-subtle rounded-md leading-5 bg-surface-white placeholder-text-secondary/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              placeholder="Ara..."
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border-subtle pt-4">
            <nav className="flex flex-col gap-2">
              {/* Categories in Mobile */}
              <div className="px-4 py-2 font-semibold text-text-charcoal text-sm uppercase tracking-wide">Kategoriler</div>
              <div className="grid grid-cols-2 gap-2 px-2 mb-4">
                {categories.slice(0, 6).map((cat) => (
                  <Link 
                    key={cat.slug}
                    href={`/kategori/${cat.slug}`} 
                    className="flex items-center gap-2 px-3 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors text-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                    {cat.name}
                  </Link>
                ))}
              </div>
              
              <hr className="border-border-subtle" />
              
              <Link href="/kesfet" className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors">
                Keşfet
              </Link>
              <Link href="/koleksiyonlar" className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors">
                Koleksiyonlar
              </Link>
              <Link href="/sanatcilar" className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors">
                Sanatçılar
              </Link>
              <Link href="/akademi" className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">school</span>
                Akademi
              </Link>
              <Link href="/blog" className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors">
                Blog
              </Link>
              <Link href="/hediyelik" className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">redeem</span>
                Hediyelik
              </Link>
              {user && (
                <>
                  <hr className="border-border-subtle my-2" />
                  {profile?.username ? (
                    <Link 
                      href={`/sanatsever/${profile.username}`} 
                      className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      Profilim
                    </Link>
                  ) : (
                    <button
                      onClick={async () => {
                        const res = await fetch("/api/me/profile");
                        if (res.ok) {
                          const data = await res.json();
                          if (data.profile?.username) {
                            window.location.href = `/sanatsever/${data.profile.username}`;
                          }
                        }
                      }}
                      className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors flex items-center gap-2 w-full text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      Profilim
                    </button>
                  )}
                  {profile?.isArtist && profile?.username && (
                    <>
                      <Link href={`/sanatsever/${profile.username}`} className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">storefront</span>
                        Profilim
                      </Link>
                      <Link href="/satici-paneli" className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                        Satıcı Paneli
                      </Link>
                    </>
                  )}
                  <Link href="/siparislerim" className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                    Siparişlerim
                  </Link>
                  <Link href="/hesap" className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">account_circle</span>
                    Hesap
                  </Link>
                  <Link href="/ayarlar" className="px-4 py-2 text-text-charcoal hover:text-primary hover:bg-background-ivory rounded-md transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    Ayarlar
                  </Link>
                </>
              )}
              {profile?.isArtist && (
                <Link
                  href="/satici-paneli"
                  className="mt-2 flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors"
                >
                  Sanatçı Paneli
                </Link>
              )}
              {user && !profile?.isArtist && (
                <Link
                  href="/sanatci-ol"
                  className="mt-2 flex items-center justify-center px-5 py-2.5 border border-primary text-sm font-medium rounded-md text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Sanatçı Ol
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
