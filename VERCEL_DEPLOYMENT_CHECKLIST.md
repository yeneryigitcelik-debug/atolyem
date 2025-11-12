# Vercel Deployment Kontrol Listesi

## 🔴 Kritik: Bu hatalar "Application error"a neden olur

### 1. Environment Variables Kontrolü

Vercel Dashboard > Projeniz > **Settings** > **Environment Variables** bölümünde şu değişkenlerin **Production** environment için tanımlı olduğundan emin olun:

#### Zorunlu Değişkenler:
```bash
✅ DATABASE_URL
   Örnek: postgresql://user:password@host:5432/database?schema=public
   ⚠️ Production database URL'i olmalı (Neon, Supabase, Railway, vb.)

✅ NEXTAUTH_SECRET
   Örnek: en-az-32-karakter-uzunlukta-rastgele-string
   ⚠️ Güçlü bir secret kullanın (openssl rand -base64 32 ile oluşturabilirsiniz)

✅ NEXTAUTH_URL
   Örnek: https://www.atolyem.net
   ⚠️ Domain'iniz tam olarak bu şekilde olmalı (www ile veya www olmadan)

✅ CLOUDFLARE_ACCOUNT_ID
   Cloudflare Dashboard > Sağ sidebar > Account ID

✅ CLOUDFLARE_ACCOUNT_HASH
   Cloudflare Dashboard > Images > Settings > Account Hash

✅ CLOUDFLARE_IMAGES_API_TOKEN
   Cloudflare Dashboard > My Profile > API Tokens > Create Token
   Permissions: Cloudflare Images:Edit

✅ CLOUDFLARE_IMAGES_VARIANT
   Genellikle: public
```

#### Opsiyonel (ama önerilen):
```bash
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH
   (Eğer frontend'de kullanılıyorsa)
```

### 2. Database Migration Kontrolü

Production database'inizde migration'ların uygulanmış olduğundan emin olun:

```bash
# Lokal olarak production database'e bağlanıp kontrol edin:
DATABASE_URL="your-production-db-url" npx prisma migrate status

# Eğer pending migration varsa:
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

**Veya Vercel Build Command'a ekleyin:**

Vercel Dashboard > Settings > General > Build & Development Settings

**Build Command:**
```bash
prisma generate && prisma migrate deploy && next build
```

### 3. Database Bağlantı Testi

Production database'inizin:
- ✅ Erişilebilir olduğundan (firewall/IP whitelist)
- ✅ Migration'ların uygulandığından
- ✅ Schema'nın doğru olduğundan

emin olun.

### 4. Build Log Kontrolü

Vercel Dashboard > Deployments > Son deployment > **Build Logs** bölümünde:
- ❌ Build hatası var mı?
- ❌ Environment variable eksikliği uyarısı var mı?
- ❌ Prisma generate hatası var mı?

### 5. Runtime Log Kontrolü

Vercel Dashboard > Deployments > Son deployment > **Runtime Logs** bölümünde:
- ❌ Database connection error var mı?
- ❌ Missing environment variable hatası var mı?
- ❌ Prisma client initialization hatası var mı?

## 🔧 Hızlı Çözüm Adımları

### Adım 1: Environment Variables Kontrolü
1. Vercel Dashboard'a gidin
2. Projeniz > Settings > Environment Variables
3. Yukarıdaki tüm değişkenlerin **Production** için tanımlı olduğundan emin olun
4. Her değişkenin değerinin doğru olduğunu kontrol edin

### Adım 2: Database Migration
```bash
# Production database URL'inizi kullanarak:
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### Adım 3: Redeploy
1. Vercel Dashboard > Deployments
2. Son deployment'ın yanındaki "..." menüsünden **Redeploy** seçin
3. Veya yeni bir commit push edin

### Adım 4: Health Check
Deploy sonrası şu URL'yi kontrol edin:
```
https://www.atolyem.net/api/health
```

Bu endpoint database bağlantısını test eder ve hata mesajı gösterir.

## 🐛 Yaygın Hatalar ve Çözümleri

### Hata: "PrismaClientInitializationError"
**Sebep:** DATABASE_URL eksik veya yanlış
**Çözüm:** Vercel Environment Variables'da DATABASE_URL'i kontrol edin

### Hata: "NEXTAUTH_SECRET is missing"
**Sebep:** NEXTAUTH_SECRET tanımlı değil
**Çözüm:** Vercel Environment Variables'a ekleyin

### Hata: "Migration not applied"
**Sebep:** Production database'de migration'lar uygulanmamış
**Çözüm:** `prisma migrate deploy` çalıştırın veya Build Command'a ekleyin

### Hata: "Database connection timeout"
**Sebep:** Database firewall/IP whitelist ayarı
**Çözüm:** Vercel'in IP adreslerini database'inize ekleyin (Neon/Supabase dashboard'dan)

## 📝 Kontrol Script'i

Lokal olarak environment variables'ları kontrol etmek için:

```bash
npm run check:env
```

Bu script Cloudflare değişkenlerini kontrol eder.

## ✅ Deployment Sonrası Test

1. Ana sayfa yükleniyor mu? → `https://www.atolyem.net`
2. Health check çalışıyor mu? → `https://www.atolyem.net/api/health`
3. Database bağlantısı var mı? → Health check response'unda `"database": "connected"` görünmeli

