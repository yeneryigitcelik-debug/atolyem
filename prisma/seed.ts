import { prisma } from "../src/lib/db";

async function main() {
  const cat = await prisma.category.upsert({
    where: { slug: "resim" },
    update: {},
    create: { name: "Resim", slug: "resim" },
  });

  const user = await prisma.user.upsert({
    where: { email: "artist@example.com" },
    update: { name: "Deneme Sanatçı", role: "SELLER" },
    create: {
      email: "artist@example.com",
      name: "Deneme Sanatçı",
      role: "SELLER",
      // Geliştirme için placeholder parola hash; prod'da gerçek hash gerekir.
      hashedPw: "dev-only",
    },
  });

  const seller = await prisma.seller.upsert({
    where: { userId: user.id },
    update: { displayName: user.name ?? "Satıcı" },
    create: { userId: user.id, displayName: user.name ?? "Satıcı" },
  });

  await prisma.product.upsert({
    where: { slug: "ilk-tablo" },
    update: {},
    create: {
      sellerId: seller.id,
      categoryId: cat.id,
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
}

main().finally(() => prisma.$disconnect());

