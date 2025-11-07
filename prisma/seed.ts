import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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

  // Kategori oluştur
  const cat = await prisma.category.upsert({
    where: { slug: "resim" },
    update: {},
    create: { name: "Resim", slug: "resim" },
  });
  console.log("Kategori oluşturuldu:", cat.name);

  // Örnek ürün oluştur
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
  console.log("Örnek ürün oluşturuldu: İlk Tablo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

