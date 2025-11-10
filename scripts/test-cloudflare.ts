/**
 * Cloudflare Images yapılandırmasını test etmek için script
 * 
 * Kullanım:
 * npx tsx scripts/test-cloudflare.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// .env dosyasını yükle
config({ path: resolve(process.cwd(), ".env") });

import { getCloudflareImageUrl } from "../lib/cloudflare-images";

async function testCloudflareConfig() {
  console.log("Cloudflare Images Yapılandırması Test Ediliyor...\n");

  // Environment variables kontrolü
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
  const accountHash = process.env.CLOUDFLARE_ACCOUNT_HASH;
  const variant = process.env.CLOUDFLARE_IMAGES_VARIANT || "public";

  console.log("Environment Variables:");
  console.log(`  CLOUDFLARE_ACCOUNT_ID: ${accountId ? "✓ Ayarlı" : "✗ Eksik"}`);
  console.log(`  CLOUDFLARE_IMAGES_API_TOKEN: ${apiToken ? "✓ Ayarlı" : "✗ Eksik"}`);
  console.log(`  CLOUDFLARE_ACCOUNT_HASH: ${accountHash ? "✓ Ayarlı" : "✗ Eksik"}`);
  console.log(`  CLOUDFLARE_IMAGES_VARIANT: ${variant}`);
  console.log("");

  if (!accountId || !apiToken || !accountHash) {
    console.error("✗ Eksik environment variable'lar var!");
    console.error("Lütfen .env dosyanızı kontrol edin.");
    process.exit(1);
  }

  // URL formatını test et
  const testImageId = "test-image-id";
  const testUrl = getCloudflareImageUrl(testImageId, variant);
  console.log("URL Format Testi:");
  console.log(`  Test Image ID: ${testImageId}`);
  console.log(`  Oluşturulan URL: ${testUrl}`);
  console.log(`  Beklenen Format: https://imagedelivery.net/${accountHash}/${testImageId}/${variant}`);
  console.log("");

  const isCorrectFormat = testUrl === `https://imagedelivery.net/${accountHash}/${testImageId}/${variant}`;
  if (isCorrectFormat) {
    console.log("✓ URL formatı doğru!");
  } else {
    console.error("✗ URL formatı yanlış!");
    process.exit(1);
  }

  console.log("\n✓ Tüm yapılandırmalar doğru görünüyor!");
  console.log("\nNot: Gerçek bir görsel yükleme testi için admin panelinden bir ürün oluşturup görsel yükleyin.");
}

testCloudflareConfig().catch((error) => {
  console.error("Test hatası:", error);
  process.exit(1);
});

