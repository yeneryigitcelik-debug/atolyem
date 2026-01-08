// Hero carousel slide data
// This can be moved to a CMS/database in the future

export interface HeroSlide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  overlay?: boolean; // Whether to show dark overlay for text readability
}

export const heroSlides: HeroSlide[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&h=1080&fit=crop",
    title: "Atölyelerden çıkan özgün eserler",
    subtitle: "Küratöryel seçkiler, doğrulanmış satıcılar ve güvenli alışveriş ile eviniz için en özel parçaları keşfedin.",
    ctaText: "Keşfet",
    ctaLink: "/kesfet",
    overlay: true,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1920&h=1080&fit=crop",
    title: "El yapımı seramik koleksiyonu",
    subtitle: "Geleneksel tekniklerle modern tasarımın buluştuğu özel parçalar.",
    ctaText: "Koleksiyonu Gör",
    ctaLink: "/koleksiyonlar",
    overlay: true,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=1920&h=1080&fit=crop",
    title: "Sınırlı sayıda özel eserler",
    subtitle: "Her biri tek ve benzersiz, sanatçıların imzasını taşıyan eserler.",
    ctaText: "Yeni Eserler",
    ctaLink: "/yeni-gelenler",
    overlay: true,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=1920&h=1080&fit=crop",
    title: "Sanatçılarla doğrudan bağlantı",
    subtitle: "Eserlerin hikayesini öğrenin, sanatçılarla tanışın.",
    ctaText: "Sanatçıları Keşfet",
    ctaLink: "/sanatcilar",
    overlay: true,
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&h=1080&fit=crop",
    title: "Eviniz için mükemmel parça",
    subtitle: "Her zevke ve bütçeye uygun, özenle seçilmiş eserler.",
    ctaText: "Hediye Rehberi",
    ctaLink: "/hediye-rehberi",
    overlay: true,
  },
];

