import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Slug oluşturma helper
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  // Admin kullanıcı oluştur
  const adminHashedPw = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@atolyem.local" },
    update: {},
    create: {
      email: "admin@atolyem.local",
      name: "Admin",
      hashedPw: adminHashedPw,
      role: "ADMIN",
    },
  });
  console.log("Admin kullanıcı oluşturuldu:", admin.email);

  // Seller kullanıcı oluştur
  const sellerHashedPw = await bcrypt.hash("seller123", 10);
  const sellerUser = await prisma.user.upsert({
    where: { email: "artist@example.com" },
    update: { name: "Deneme Sanatçı", role: "SELLER", hashedPw: sellerHashedPw },
    create: {
      email: "artist@example.com",
      name: "Deneme Sanatçı",
      role: "SELLER",
      hashedPw: sellerHashedPw,
    },
  });

  const seller = await prisma.seller.upsert({
    where: { userId: sellerUser.id },
    update: { displayName: sellerUser.name ?? "Satıcı" },
    create: { userId: sellerUser.id, displayName: sellerUser.name ?? "Satıcı" },
  });
  console.log("Seller kullanıcı oluşturuldu:", sellerUser.email);

  // Kategorileri oluştur
  const categories = [
    {
      name: "Tablo & Resim",
      slug: "tablo-resim",
      children: [
        "Yağlıboya",
        "Akrilik",
        "Sulu Boya",
        "Pastel",
        "Karakalem",
        "Dijital Resim (limitli edisyon)",
        "Mini tablolar",
      ],
    },
    {
      name: "Baskı & Gravür",
      slug: "baski-gravur",
      children: [
        "Fine Art Print (Giclée)",
        "Linolyum/Linocut",
        "Serigrafi",
        "Ağaç baskı",
        "Taş baskı",
        "Monotip",
      ],
    },
    {
      name: "Fotoğraf",
      slug: "fotograf",
      children: [
        "Siyah-beyaz",
        "Renkli",
        "Analog",
        "Polaroid",
        "Limitli edisyon foto baskı",
      ],
    },
    {
      name: "Heykel & Seramik",
      slug: "heykel-seramik",
      children: [
        "Seramik obje",
        "Heykel (metal/ahşap/taş)",
        "Biblolar",
        "Vazo",
        "Saksı",
      ],
    },
    {
      name: "Cam & Mozaik",
      slug: "cam-mozaik",
      children: [
        "Füzyon cam",
        "Vitray",
        "Mozaik panolar",
        "Cam objeler",
      ],
    },
    {
      name: "Ahşap & Marangozluk",
      slug: "ahsap-marangozluk",
      children: [
        "Ahşap oyma",
        "Raf/mini mobilya",
        "Kesme tahtası",
        "Dekoratif objeler",
        "Yakma (pyrography)",
      ],
    },
    {
      name: "Kağıt Sanatları",
      slug: "kagit-sanatlari",
      children: [
        "Origami",
        "Quilling",
        "Kağıt rölyef",
        "Kolaj",
        "Kitap sanatı",
      ],
    },
    {
      name: "İllüstrasyon & Çizim",
      slug: "illustrasyon-cizim",
      children: [
        "Orijinal illüstrasyon",
        "Karakter tasarım",
        "Çizim defterleri",
        "Zine",
      ],
    },
    {
      name: "Tekstil & El İşi",
      slug: "tekstil-el-isi",
      children: [
        "Nakış",
        "Dokuma",
        "Makrome",
        "Örgü",
        "Patchwork/Quilt",
        "Kanaviçe panolar",
      ],
    },
    {
      name: "Moda & Aksesuar",
      slug: "moda-aksesuar",
      children: [
        "El yapımı takı (kolye/küpe/bileklik/broş)",
        "Tote bag",
        "Şapka",
        "Eşarp",
        "Baskılı tişört/hoodie (kendi tasarımın)",
      ],
    },
    {
      name: "Deri Ürünleri",
      slug: "deri-urunleri",
      children: [
        "Cüzdan",
        "Kartlık",
        "Anahtarlık",
        "Kılıf/kap",
      ],
    },
    {
      name: "Ev Dekorasyonu",
      slug: "ev-dekorasyonu",
      children: [
        "Duvar süsleri",
        "Poster",
        "Saat",
        "Rüzgâr çanı",
        "Dreamcatcher",
      ],
    },
    {
      name: "Mum & Sabun",
      slug: "mum-sabun",
      children: [
        "Soya mum",
        "Aromaterapi mum",
        "Şekilli mum",
        "El yapımı sabun",
      ],
    },
    {
      name: "Mutfak & Sofra",
      slug: "mutfak-sofra",
      children: [
        "Seramik tabak/kupa",
        "Sunum tahtası",
        "Bardak altlığı",
        "Peçete halkası",
      ],
    },
    {
      name: "Bitki & Çiçek Sanatı",
      slug: "bitki-cicek-sanati",
      children: [
        "Kuru çiçek aranjmanı",
        "Preslenmiş çiçek tablo",
        "Teraryum",
      ],
    },
    {
      name: "Çocuk & Bebek",
      slug: "cocuk-bebek",
      children: [
        "Keçe/örgü oyuncak (amigurumi)",
        "Oda dekoru",
        "Eğitim setleri",
        "Poster",
      ],
    },
    {
      name: "Dijital Ürünler",
      slug: "dijital-urunler",
      children: [
        "Poster PDF",
        "Davetiye şablonu",
        "SVG/PNG kesim dosyaları (Cricut)",
        "Procreate fırça/kalıp",
        "Lightroom preset",
      ],
    },
    {
      name: "Kişiye Özel Ürünler",
      slug: "kisiye-ozel-urunler",
      children: [
        "İsimli tablo/portre",
        "Özel tarih-mekân illüstrasyonu",
        "Gravür/oyma kişiselleştirme",
      ],
    },
    {
      name: "Setler & DIY Kitler",
      slug: "setler-diy-kitler",
      children: [
        "Boyama kitleri",
        "Seramik el yapım seti",
        "Nakış başlangıç kiti",
        "Linocut başlangıç kiti",
      ],
    },
    {
      name: "Sanat Malzemeleri",
      slug: "sanat-malzemeleri",
      children: [
        "El yapımı fırça/kalem",
        "Doğal pigment",
        "El yapımı eskiz defteri",
      ],
    },
  ];

  // Ana kategorileri oluştur
  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: {
        name: cat.name,
        slug: cat.slug,
      },
    });

    // Alt kategorileri oluştur
    for (const childName of cat.children) {
      const childSlug = slugify(childName);
      await prisma.category.upsert({
        where: { slug: childSlug },
        update: {
          name: childName,
          parentId: parent.id,
        },
        create: {
          name: childName,
          slug: childSlug,
          parentId: parent.id,
        },
      });
    }
    console.log(`Kategori oluşturuldu: ${cat.name} (${cat.children.length} alt kategori)`);
  }

  // Örnek ürün oluştur
  const exampleCategory = await prisma.category.findFirst({
    where: { slug: "tablo-resim" },
  });

  if (exampleCategory) {
    await prisma.product.upsert({
      where: { slug: "ilk-tablo" },
      update: {},
      create: {
        sellerId: seller.id,
        categoryId: exampleCategory.id,
        title: "İlk Tablo",
        slug: "ilk-tablo",
        description: "Akrilik boya, 50x70",
        isActive: true,
        images: { create: [{ url: "/uploads/sample.jpg", alt: "Örnek görsel", sort: 0 }] },
        variants: {
          create: [{ sku: "ILK-TABLO-001", priceCents: 199900, stock: 1 }],
        },
      },
    });
    console.log("Örnek ürün oluşturuldu: İlk Tablo");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
