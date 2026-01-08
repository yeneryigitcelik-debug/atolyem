"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import Image from "next/image";

interface Artist {
  id: string;
  name: string;
  username: string;
  specialty: string;
  slug: string;
  image: string | null;
  works: number;
  bio: string | null;
  featured?: boolean;
}

export default function SanatcilarPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtists() {
      try {
        const res = await fetch("/api/artists");
        if (res.ok) {
          const data = await res.json();
          setArtists(data.artists || []);
        } else {
          setError("Sanatçılar yüklenemedi");
        }
      } catch (err) {
        console.error("Error fetching artists:", err);
        setError("Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    fetchArtists();
  }, []);

  const featuredArtists = artists.slice(0, 3);
  const allArtists = artists;

  if (loading) {
    return (
      <>
        <PageHeader 
          title="Sanatçılar" 
          description="Türkiye'nin en yetenekli sanatçılarını keşfedin ve eserlerini inceleyin."
        />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader 
          title="Sanatçılar" 
          description="Türkiye'nin en yetenekli sanatçılarını keşfedin ve eserlerini inceleyin."
        />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EmptyState
            icon="error"
            title="Bir Hata Oluştu"
            description={error}
            actionLabel="Tekrar Dene"
            onAction={() => window.location.reload()}
          />
        </div>
      </>
    );
  }

  if (artists.length === 0) {
    return (
      <>
        <PageHeader 
          title="Sanatçılar" 
          description="Türkiye'nin en yetenekli sanatçılarını keşfedin ve eserlerini inceleyin."
        />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EmptyState
            icon="person_off"
            title="Henüz Sanatçı Yok"
            description="Platformumuzda henüz sanatçı bulunmuyor. İlk sanatçı siz olmak ister misiniz?"
            actionLabel="Sanatçı Ol"
            actionHref="/sanatci-ol"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        title="Sanatçılar" 
        description="Türkiye'nin en yetenekli sanatçılarını keşfedin ve eserlerini inceleyin."
      />

      {/* Featured Artists */}
      {featuredArtists.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-text-charcoal mb-8">Öne Çıkan Sanatçılar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArtists.map((artist) => (
              <Link key={artist.id} href={`/sanatsever/${artist.slug}`} className="group">
                <div className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-lg">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                    {artist.image ? (
                      <Image
                        src={artist.image}
                        alt={artist.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="material-symbols-outlined text-6xl text-primary/50">person</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-[12px] mr-1">verified</span>
                        Doğrulanmış
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text-charcoal group-hover:text-primary transition-colors">{artist.name}</h3>
                    <p className="text-text-secondary text-sm mt-1">{artist.specialty}</p>
                    <p className="text-text-secondary text-xs mt-3">{artist.works} eser</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Artists */}
      <section className="bg-surface-warm border-y border-border-subtle py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-text-charcoal">Tüm Sanatçılar</h2>
            <p className="text-text-secondary">{allArtists.length} sanatçı</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {allArtists.map((artist) => (
              <Link key={artist.id} href={`/sanatsever/${artist.slug}`} className="group">
                <div className="bg-surface-white rounded-lg border border-border-subtle p-4 hover:border-primary transition-all duration-300 hover:shadow-md text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 relative bg-gray-100">
                    {artist.image ? (
                      <Image
                        src={artist.image}
                        alt={artist.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="material-symbols-outlined text-2xl text-primary/50">person</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-text-charcoal group-hover:text-primary transition-colors">{artist.name}</h3>
                  <p className="text-text-secondary text-sm mt-1">{artist.specialty}</p>
                  <p className="text-text-secondary text-xs mt-2">{artist.works} eser</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-primary rounded-lg p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Siz de Sanatçı Olun</h3>
          <p className="text-white/80 max-w-xl mx-auto mb-8">Eserlerinizi binlerce sanat severe ulaştırın. Atölyem.net&apos;te satış yapmak çok kolay.</p>
          <Link href="/sanatci-ol" className="inline-flex px-8 py-3 bg-white text-primary font-semibold rounded-md hover:bg-gray-100 transition-colors">
            Hemen Başla
          </Link>
        </div>
      </section>
    </>
  );
}
