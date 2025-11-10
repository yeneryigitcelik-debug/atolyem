/**
 * Mevcut ürün görsellerinin URL'lerini düzeltmek için script
 * 
 * Kullanım:
 * npx tsx scripts/fix-image-urls.ts
 * 
 * Bu script, veritabanındaki tüm ürün görsellerinin URL'lerini kontrol eder
 * ve Cloudflare Images formatına uygun hale getirir.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLOUDFLARE_ACCOUNT_HASH = process.env.CLOUDFLARE_ACCOUNT_HASH || "5uHlQDyzeO-VZtA207nD0w";
const DEFAULT_VARIANT = process.env.CLOUDFLARE_IMAGES_VARIANT || "public";

/**
 * URL'den image ID'yi çıkarır
 * Örnek: https://imagedelivery.net/5uHlQDyzeO-VZtA207nD0w/abc123/public -> abc123
 */
function extractImageId(url: string): string | null {
  // Eğer URL zaten doğru formattaysa, image ID'yi çıkar
  const match = url.match(/imagedelivery\.net\/[^/]+\/([^/]+)\//);
  if (match) {
    return match[1];
  }
  
  // Eğer URL sadece image ID ise, direkt döndür
  if (!url.includes("http") && !url.includes("/")) {
    return url;
  }
  
  return null;
}

/**
 * Cloudflare Images URL'i oluşturur
 */
function createCloudflareUrl(imageId: string, variant: string = DEFAULT_VARIANT): string {
  return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/${variant}`;
}

async function main() {
  console.log("Ürün görselleri kontrol ediliyor...\n");

  const products = await prisma.product.findMany({
    include: {
      images: true,
    },
  });

  let updatedCount = 0;
  let errorCount = 0;

  for (const product of products) {
    for (const image of product.images) {
      try {
        // Eğer URL zaten doğru formattaysa, atla
        if (image.url.includes(`imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/`)) {
          console.log(`✓ ${product.title} - Görsel zaten doğru format: ${image.url}`);
          continue;
        }

        // Image ID'yi çıkar
        const imageId = extractImageId(image.url);
        
        if (!imageId) {
          console.log(`⚠ ${product.title} - Görsel URL'i geçersiz: ${image.url}`);
          errorCount++;
          continue;
        }

        // Yeni URL'i oluştur
        const newUrl = createCloudflareUrl(imageId);

        // Veritabanını güncelle
        await prisma.productImage.update({
          where: { id: image.id },
          data: { url: newUrl },
        });

        console.log(`✓ ${product.title} - Görsel güncellendi:`);
        console.log(`  Eski: ${image.url}`);
        console.log(`  Yeni: ${newUrl}\n`);

        updatedCount++;
      } catch (error: any) {
        console.error(`✗ ${product.title} - Hata: ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log("\n=== Özet ===");
  console.log(`Güncellenen görsel: ${updatedCount}`);
  console.log(`Hata: ${errorCount}`);
  console.log(`Toplam ürün: ${products.length}`);
}

main()
  .catch((error) => {
    console.error("Script hatası:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

