/**
 * Cloudflare API Token'ı test eder
 * 
 * Kullanım: node scripts/test-cloudflare-token.js
 */

require("dotenv").config();

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN?.trim();

console.log("=== Cloudflare API Token Test ===\n");

// Environment variable kontrolü
if (!accountId) {
  console.error("❌ CLOUDFLARE_ACCOUNT_ID bulunamadı!");
  process.exit(1);
}

if (!apiToken) {
  console.error("❌ CLOUDFLARE_IMAGES_API_TOKEN bulunamadı!");
  process.exit(1);
}

console.log("✓ Account ID:", accountId.substring(0, 10) + "...");
console.log("✓ API Token:", apiToken.substring(0, 10) + "...");
console.log("✓ Token uzunluğu:", apiToken.length, "karakter");
console.log("");

// Token format kontrolü
if (apiToken.length < 20) {
  console.error("❌ Token çok kısa! Geçerli bir Cloudflare API Token'ı genellikle 40+ karakterdir.");
  process.exit(1);
}

if (apiToken.includes(" ")) {
  console.error("❌ Token'da boşluk karakteri var! Lütfen .env dosyasındaki token'ı kontrol edin.");
  process.exit(1);
}

// API test isteği
console.log("Cloudflare API'ye test isteği gönderiliyor...\n");

fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  },
})
  .then(async (response) => {
    const text = await response.text();
    
    if (!response.ok) {
      console.error("❌ API Token kimlik doğrulama başarısız!");
      console.error("Status:", response.status);
      console.error("Response:", text);
      
      try {
        const errorData = JSON.parse(text);
        if (errorData.errors && errorData.errors[0]?.code === 10001) {
          console.error("\n💡 Çözüm:");
          console.error("1. Cloudflare Dashboard → My Profile → API Tokens");
          console.error("2. Yeni bir token oluşturun");
          console.error("3. Token'a 'Account - Cloudflare Images - Edit' izni verin");
          console.error("4. Token'ı .env dosyasına ekleyin");
          console.error("5. Development server'ı yeniden başlatın");
          console.error("\nDetaylı rehber: HOW_TO_CREATE_CLOUDFLARE_API_TOKEN.md");
        }
      } catch (e) {
        // JSON parse hatası
      }
      
      process.exit(1);
    }
    
    try {
      const data = JSON.parse(text);
      if (data.success) {
        console.log("✅ API Token geçerli!");
        console.log("✅ Account:", data.result?.name || "Bilinmiyor");
        console.log("\nToken çalışıyor. Görsel yükleme işlemini deneyebilirsiniz.");
      } else {
        console.error("❌ API yanıtı başarısız:", text);
        process.exit(1);
      }
    } catch (e) {
      console.error("❌ API yanıtı parse edilemedi:", text);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Network hatası:", error.message);
    process.exit(1);
  });

