"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

type TabType = "egitimler" | "etkinlikler" | "setler";

const workshops = [
  {
    id: 1,
    title: "Yağlı Boya Resim Başlangıç",
    instructor: "Sinem Demirtaş",
    instructorSlug: "sinem-demirtas",
    type: "online",
    level: "Başlangıç",
    duration: "8 Hafta",
    sessions: 16,
    price: 2500,
    originalPrice: 3500,
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&h=300&fit=crop",
    category: "Resim",
    rating: 4.9,
    students: 156,
    startDate: "15 Şubat 2026",
    description: "Yağlı boya tekniklerinin temellerini öğrenin. Renk teorisi, fırça teknikleri ve kompozisyon.",
  },
  {
    id: 2,
    title: "Seramik El Yapımı Atölyesi",
    instructor: "Mehmet Demir",
    instructorSlug: "mehmet-demir",
    type: "yuzeyuze",
    level: "Orta",
    duration: "6 Hafta",
    sessions: 12,
    price: 3200,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&h=300&fit=crop",
    category: "Seramik",
    rating: 4.8,
    students: 89,
    startDate: "1 Mart 2026",
    location: "İzmir Atölye",
    description: "Çark ve el yapımı seramik teknikleri. Sırlama ve pişirme süreçleri dahil.",
  },
  {
    id: 3,
    title: "Dijital Sanat & İllüstrasyon",
    instructor: "Ali Öztürk",
    instructorSlug: "ali-ozturk",
    type: "online",
    level: "Başlangıç",
    duration: "4 Hafta",
    sessions: 8,
    price: 1800,
    originalPrice: 2200,
    image: "https://images.unsplash.com/photo-1618004912476-29818d81ae2e?w=500&h=300&fit=crop",
    category: "Dijital Sanat",
    rating: 4.7,
    students: 234,
    startDate: "20 Ocak 2026",
    description: "Procreate ve Adobe Illustrator ile dijital çizim teknikleri.",
  },
  {
    id: 4,
    title: "Heykel & Form Çalışmaları",
    instructor: "Ayşe Yılmaz",
    instructorSlug: "ayse-yilmaz",
    type: "yuzeyuze",
    level: "İleri",
    duration: "10 Hafta",
    sessions: 20,
    price: 4500,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&h=300&fit=crop",
    category: "Heykel",
    rating: 5.0,
    students: 42,
    startDate: "10 Şubat 2026",
    location: "Ankara Atölye",
    description: "Kil, bronz ve taş ile heykel yapım teknikleri. Anatomi ve form çalışmaları.",
  },
  {
    id: 5,
    title: "Sulu Boya Manzara Resmi",
    instructor: "Fatma Çelik",
    instructorSlug: "fatma-celik",
    type: "online",
    level: "Orta",
    duration: "6 Hafta",
    sessions: 12,
    price: 1500,
    originalPrice: 2000,
    image: "https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=500&h=300&fit=crop",
    category: "Resim",
    rating: 4.8,
    students: 178,
    startDate: "5 Şubat 2026",
    description: "Sulu boya ile doğa manzaraları. Gökyüzü, su ve yeşillik teknikleri.",
  },
  {
    id: 6,
    title: "Cam Füzyon Teknikleri",
    instructor: "Emre Arslan",
    instructorSlug: "emre-arslan",
    type: "yuzeyuze",
    level: "Başlangıç",
    duration: "4 Hafta",
    sessions: 8,
    price: 2800,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=500&h=300&fit=crop",
    category: "Cam Sanatı",
    rating: 4.9,
    students: 56,
    startDate: "25 Ocak 2026",
    location: "Eskişehir Atölye",
    description: "Cam kesme, füzyon ve şekillendirme teknikleri. Takı ve dekoratif parçalar.",
  },
];

const events = [
  {
    id: 1,
    title: "Sanat & Kahve Buluşması",
    type: "yuzeyuze",
    date: "25 Ocak 2026",
    time: "14:00 - 17:00",
    location: "İstanbul, Kadıköy",
    price: 0,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&h=300&fit=crop",
    attendees: 45,
    maxAttendees: 50,
    description: "Sanatçılar ve sanat severler için sohbet ve networking etkinliği.",
  },
  {
    id: 2,
    title: "Online Canlı Çizim Maratonu",
    type: "online",
    date: "1 Şubat 2026",
    time: "10:00 - 18:00",
    price: 150,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=300&fit=crop",
    attendees: 120,
    maxAttendees: 500,
    description: "8 saatlik canlı çizim etkinliği. Ödüllü yarışma ve atölyeler.",
  },
  {
    id: 3,
    title: "Seramik Sergisi Açılışı",
    type: "yuzeyuze",
    date: "10 Şubat 2026",
    time: "18:00 - 21:00",
    location: "İzmir Modern Sanat Galerisi",
    price: 0,
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&h=300&fit=crop",
    attendees: 78,
    maxAttendees: 100,
    description: "Atölyem.net sanatçılarının seramik sergisi açılış kokteyli.",
  },
  {
    id: 4,
    title: "Dijital Sanat Webinarı",
    type: "online",
    date: "15 Şubat 2026",
    time: "20:00 - 22:00",
    price: 0,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop",
    attendees: 234,
    maxAttendees: null,
    description: "AI ve sanat: Yapay zeka çağında dijital sanatın geleceği.",
  },
];

const artSets = [
  {
    id: 1,
    title: "Profesyonel Yağlı Boya Seti",
    category: "Resim",
    items: 42,
    price: 1250,
    originalPrice: 1600,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 89,
    badge: "En Çok Satan",
    contents: ["24 adet yağlı boya tüpü", "8 adet fırça seti", "Tuval (3 adet)", "Palet ve spatula", "Temizleme seti"],
  },
  {
    id: 2,
    title: "Heykel Başlangıç Seti",
    category: "Heykel",
    items: 18,
    price: 850,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 45,
    badge: null,
    contents: ["5 kg seramik kili", "Modelleme aletleri (12 parça)", "Çalışma tezgahı örtüsü", "Kılavuz kitapçık"],
  },
  {
    id: 3,
    title: "Sulu Boya Premium Set",
    category: "Resim",
    items: 36,
    price: 680,
    originalPrice: 850,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 156,
    badge: "Yeni",
    contents: ["24 renk sulu boya", "6 adet fırça", "Sulu boya defteri (A4)", "Maskeleme sıvısı", "Palet"],
  },
  {
    id: 4,
    title: "Seramik Atölye Seti",
    category: "Seramik",
    items: 28,
    price: 1450,
    originalPrice: 1800,
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 67,
    badge: "Öğretmen Tavsiyesi",
    contents: ["10 kg seramik kili", "Çark aksesuarları", "Sır boyaları (6 renk)", "Şekillendirme aletleri", "Fırın tepsisi"],
  },
  {
    id: 5,
    title: "Karakalem Profesyonel Set",
    category: "Çizim",
    items: 52,
    price: 420,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 203,
    badge: null,
    contents: ["24 adet grafit kalem", "12 adet kömür kalem", "Silgiler ve tortillonlar", "Eskiz defteri", "Taşıma çantası"],
  },
  {
    id: 6,
    title: "Cam Sanatı Başlangıç Seti",
    category: "Cam Sanatı",
    items: 22,
    price: 980,
    originalPrice: 1200,
    image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 34,
    badge: null,
    contents: ["Cam parçaları seti", "Kesme aletleri", "Koruyucu ekipman", "Lehim malzemeleri", "Eğitim kitapçığı"],
  },
];

export default function AkademiPage() {
  const [activeTab, setActiveTab] = useState<TabType>("egitimler");
  const [workshopFilter, setWorkshopFilter] = useState<"all" | "online" | "yuzeyuze">("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const filteredWorkshops = workshops.filter((w) => {
    if (workshopFilter !== "all" && w.type !== workshopFilter) return false;
    if (levelFilter !== "all" && w.level !== levelFilter) return false;
    return true;
  });

  const filteredEvents = events.filter((e) => {
    if (workshopFilter !== "all" && e.type !== workshopFilter) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Atölyem Akademi"
        description="Sanat yolculuğunuza profesyonel eğitimlerle başlayın. Ustalardan öğrenin, yeteneklerinizi geliştirin."
        badge="Yeni Dönem Başlıyor!"
      />

      {/* Stats */}
      <section className="bg-primary py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-white/80 text-sm">Aktif Eğitim</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">3,500+</p>
              <p className="text-white/80 text-sm">Mezun Öğrenci</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">25+</p>
              <p className="text-white/80 text-sm">Uzman Eğitmen</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">4.8</p>
              <p className="text-white/80 text-sm">Ortalama Puan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-surface-white border-b border-border-subtle sticky top-20 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("egitimler")}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "egitimler"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-charcoal"
              }`}
            >
              <span className="material-symbols-outlined">school</span>
              Eğitimler & Atölyeler
            </button>
            <button
              onClick={() => setActiveTab("etkinlikler")}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "etkinlikler"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-charcoal"
              }`}
            >
              <span className="material-symbols-outlined">event</span>
              Etkinlikler
            </button>
            <button
              onClick={() => setActiveTab("setler")}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "setler"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-charcoal"
              }`}
            >
              <span className="material-symbols-outlined">inventory_2</span>
              Sanat Setleri
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        {(activeTab === "egitimler" || activeTab === "etkinlikler") && (
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex rounded-lg border border-border-subtle overflow-hidden">
              <button
                onClick={() => setWorkshopFilter("all")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  workshopFilter === "all"
                    ? "bg-primary text-white"
                    : "bg-surface-white text-text-charcoal hover:bg-background-ivory"
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setWorkshopFilter("online")}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                  workshopFilter === "online"
                    ? "bg-primary text-white"
                    : "bg-surface-white text-text-charcoal hover:bg-background-ivory"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">videocam</span>
                Online
              </button>
              <button
                onClick={() => setWorkshopFilter("yuzeyuze")}
                className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                  workshopFilter === "yuzeyuze"
                    ? "bg-primary text-white"
                    : "bg-surface-white text-text-charcoal hover:bg-background-ivory"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">groups</span>
                Yüz Yüze
              </button>
            </div>

            {activeTab === "egitimler" && (
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-4 py-2 border border-border-subtle rounded-lg text-sm bg-surface-white focus:outline-none focus:border-primary"
              >
                <option value="all">Tüm Seviyeler</option>
                <option value="Başlangıç">Başlangıç</option>
                <option value="Orta">Orta</option>
                <option value="İleri">İleri</option>
              </select>
            )}
          </div>
        )}

        {/* Eğitimler Tab */}
        {activeTab === "egitimler" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => (
              <div
                key={workshop.id}
                className="bg-surface-white rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative aspect-[5/3] overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url('${workshop.image}')` }}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        workshop.type === "online"
                          ? "bg-blue-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {workshop.type === "online" ? "Online" : "Yüz Yüze"}
                    </span>
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-surface-white/90 text-text-charcoal">
                      {workshop.level}
                    </span>
                  </div>
                  {workshop.originalPrice && (
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-bold bg-red-500 text-white">
                      %{Math.round((1 - workshop.price / workshop.originalPrice) * 100)} İndirim
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                    <span className="px-2 py-0.5 bg-background-ivory rounded">{workshop.category}</span>
                    <span>•</span>
                    <span>{workshop.duration}</span>
                    <span>•</span>
                    <span>{workshop.sessions} Ders</span>
                  </div>
                  <h3 className="font-bold text-text-charcoal text-lg mb-2 line-clamp-2">{workshop.title}</h3>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{workshop.description}</p>
                  <Link
                    href={`/sanatsever/${workshop.instructorSlug}`}
                    className="flex items-center gap-2 mb-4 hover:text-primary transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-xs">{workshop.instructor[0]}</span>
                    </div>
                    <span className="text-sm font-medium text-text-charcoal">{workshop.instructor}</span>
                  </Link>
                  <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[16px]">star</span>
                      <span className="font-medium text-text-charcoal">{workshop.rating}</span>
                      <span>({workshop.students} öğrenci)</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      {workshop.startDate}
                    </span>
                  </div>
                  {workshop.location && (
                    <div className="flex items-center gap-1 text-sm text-text-secondary mb-4">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {workshop.location}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                    <div>
                      <span className="text-xl font-bold text-text-charcoal">
                        {workshop.price.toLocaleString("tr-TR")} ₺
                      </span>
                      {workshop.originalPrice && (
                        <span className="text-sm text-text-secondary line-through ml-2">
                          {workshop.originalPrice.toLocaleString("tr-TR")} ₺
                        </span>
                      )}
                    </div>
                    <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors">
                      Kayıt Ol
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Etkinlikler Tab */}
        {activeTab === "etkinlikler" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-surface-white rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow flex flex-col sm:flex-row"
              >
                <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${event.image}')` }}
                  />
                  <span
                    className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium ${
                      event.type === "online" ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                    }`}
                  >
                    {event.type === "online" ? "Online" : "Yüz Yüze"}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      {event.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {event.time}
                    </span>
                  </div>
                  <h3 className="font-bold text-text-charcoal text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-text-secondary mb-3 flex-grow">{event.description}</p>
                  {event.location && (
                    <div className="flex items-center gap-1 text-sm text-text-secondary mb-3">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {event.location}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-text-charcoal">
                        {event.price === 0 ? "Ücretsiz" : `${event.price} ₺`}
                      </span>
                      {event.maxAttendees && (
                        <span className="text-xs text-text-secondary">
                          ({event.attendees}/{event.maxAttendees} katılımcı)
                        </span>
                      )}
                    </div>
                    <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors">
                      Katıl
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sanat Setleri Tab */}
        {activeTab === "setler" && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-text-charcoal mb-2">Sanat Setleri</h2>
              <p className="text-text-secondary">
                Profesyonel sanatçılar tarafından hazırlanan, eğitimlerle uyumlu sanat malzeme setleri.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artSets.map((set) => (
                <div
                  key={set.id}
                  className="bg-surface-white rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${set.image}')` }}
                    />
                    {set.badge && (
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium bg-primary text-white">
                        {set.badge}
                      </span>
                    )}
                    {set.originalPrice && (
                      <span className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-bold bg-red-500 text-white">
                        %{Math.round((1 - set.price / set.originalPrice) * 100)} İndirim
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                      <span className="px-2 py-0.5 bg-background-ivory rounded">{set.category}</span>
                      <span>•</span>
                      <span>{set.items} Parça</span>
                    </div>
                    <h3 className="font-bold text-text-charcoal text-lg mb-3">{set.title}</h3>
                    <div className="flex items-center gap-1 text-sm mb-3">
                      <span className="material-symbols-outlined text-primary text-[16px]">star</span>
                      <span className="font-medium text-text-charcoal">{set.rating}</span>
                      <span className="text-text-secondary">({set.reviews} değerlendirme)</span>
                    </div>
                    <ul className="text-sm text-text-secondary space-y-1 mb-4">
                      {set.contents.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                          {item}
                        </li>
                      ))}
                      {set.contents.length > 3 && (
                        <li className="text-primary text-xs font-medium">+{set.contents.length - 3} ürün daha</li>
                      )}
                    </ul>
                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <div>
                        <span className="text-xl font-bold text-text-charcoal">
                          {set.price.toLocaleString("tr-TR")} ₺
                        </span>
                        {set.originalPrice && (
                          <span className="text-sm text-text-secondary line-through ml-2">
                            {set.originalPrice.toLocaleString("tr-TR")} ₺
                          </span>
                        )}
                      </div>
                      <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        Sepete Ekle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-surface-warm border-t border-border-subtle py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-charcoal mb-4">Eğitmen Olmak İster misiniz?</h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            Sanat alanındaki uzmanlığınızı binlerce öğrenciyle paylaşın. Atölyem Akademi eğitmeni olun,
            kendi programınızı oluşturun ve gelir elde edin.
          </p>
          <Link
            href="/sanatci-ol"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">person_add</span>
            Eğitmen Başvurusu Yap
          </Link>
        </div>
      </section>
    </>
  );
}


