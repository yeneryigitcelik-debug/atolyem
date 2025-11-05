import { prisma } from "../src/lib/db";

async function main() {
  const cat = await prisma.category.upsert({
    where: { slug: "resim" },
    update: {},
    create: { name: "Resim", slug: "resim" },
  });

  const artist = await prisma.user.upsert({
    where: { email: "artist@example.com" },
    update: {},
    create: { email: "artist@example.com", name: "Deneme Sanatçı", role: "ARTIST" },
  });

  await prisma.product.upsert({
    where: { slug: "ilk-tablo" },
    update: {},
    create: {
      title: "İlk Tablo",
      slug: "ilk-tablo",
      description: "Akrilik boya, 50x70",
      priceTL: 199900,
      stock: 1,
      isPublished: true,
      categoryId: cat.id,
      artistId: artist.id,
      images: { create: [{ url: "/uploads/sample.jpg", alt: "Örnek görsel", order: 0 }] },
    },
  });
}

main().finally(() => prisma.$disconnect());
