"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface AccountSidebarProps {
  activePage: "profilim" | "profil-duzenle" | "siparislerim" | "mesajlarim" | "favorilerim" | "adreslerim" | "hesap" | "ayarlar";
}

const menuItems = [
  { key: "profilim", label: "Profilim", icon: "person", href: "/hesap" }, // Dynamic href - will be overridden
  { key: "profil-duzenle", label: "Profil Düzenle", icon: "edit", href: "/profil-duzenle" },
  { key: "siparislerim", label: "Siparişlerim", icon: "shopping_bag", href: "/siparislerim" },
  { key: "mesajlarim", label: "Mesajlarım", icon: "mail", href: "/mesajlar" },
  { key: "favorilerim", label: "Favorilerim", icon: "favorite", href: "/favoriler" },
  { key: "adreslerim", label: "Adreslerim", icon: "location_on", href: "/adreslerim" },
  { key: "hesap", label: "Hesap", icon: "account_circle", href: "/hesap" },
  { key: "ayarlar", label: "Ayarlar", icon: "settings", href: "/ayarlar" },
];

export default function AccountSidebar({ activePage }: AccountSidebarProps) {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="bg-surface-white rounded-lg border border-border-subtle p-6 h-fit">
      {/* User Info */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
        {profile?.avatarUrl ? (
          <div 
            className="w-12 h-12 rounded-full bg-cover bg-center border border-border-subtle"
            style={{ backgroundImage: `url('${profile.avatarUrl}')` }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">
              {profile?.displayName?.[0]?.toUpperCase() || user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
        )}
        <div>
          <p className="font-semibold text-text-charcoal">
            {profile?.displayName || user.user_metadata?.full_name || "Kullanıcı"}
          </p>
          <p className="text-sm text-text-secondary truncate max-w-[150px]">
            {profile?.username ? `@${profile.username}` : user.email}
          </p>
          {profile?.isArtist && (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[12px]">palette</span>
              Sanatçı
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = item.key === activePage;
          
          // Handle dynamic profile link
          let href = item.href;
          if (item.key === "profilim") {
            href = profile?.username ? `/sanatsever/${profile.username}` : "/hesap";
          }

          // For profilim, handle the case when profile is not loaded
          if (item.key === "profilim" && !profile?.username) {
            return (
              <button
                key={item.key}
                onClick={async () => {
                  const res = await fetch("/api/me/profile");
                  if (res.ok) {
                    const data = await res.json();
                    if (data.profile?.username) {
                      window.location.href = `/sanatsever/${data.profile.username}`;
                    }
                  }
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors text-left ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-text-charcoal hover:bg-background-ivory"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.key}
              href={href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-text-charcoal hover:bg-background-ivory"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Artist Links */}
        {profile?.isArtist && profile?.shopSlug && (
          <>
            <hr className="border-border-subtle my-3" />
            <Link 
              href={`/sanatci/${profile.shopSlug}`} 
              className="flex items-center gap-2 px-4 py-2.5 text-text-charcoal hover:bg-background-ivory rounded-md transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              Dükkanım
            </Link>
            <Link 
              href="/satici-paneli" 
              className="flex items-center gap-2 px-4 py-2.5 text-text-charcoal hover:bg-background-ivory rounded-md transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Satıcı Paneli
            </Link>
          </>
        )}

        {/* Sign Out */}
        <hr className="border-border-subtle my-3" />
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Çıkış Yap
        </button>
      </nav>
    </div>
  );
}

