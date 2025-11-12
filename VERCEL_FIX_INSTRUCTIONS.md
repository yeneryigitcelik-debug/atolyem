# Vercel Build Hatası Düzeltme Talimatları

## 🔴 Sorun
Build sırasında `localhost:5432` hatası alıyorsunuz. Bu, Vercel'de `DATABASE_URL` environment variable'ının ayarlanmadığını gösterir.

**⚠️ ÖNEMLİ:** Production database (Supabase, Neon, vb.) kurulmadan Vercel'de uygulama çalışmaz!

Detaylı kurulum için: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## ✅ Yapılacaklar

### 1. Vercel'de Environment Variables Ayarlama (KRİTİK!)

1. **Vercel Dashboard**'a gidin: https://vercel.com/dashboard
2. Projenizi seçin
3. **Settings** > **Environment Variables** bölümüne gidin
4. Şu değişkenleri **Production** environment için ekleyin:

```
DATABASE_URL
Değer: postgresql://user:password@host:5432/database?schema=public
⚠️ Production database URL'inizi buraya yapıştırın (Neon, Supabase, Railway, vb.)

📚 Supabase kurulumu için: SUPABASE_SETUP.md dosyasına bakın
```

```
NEXTAUTH_SECRET
Değer: en-az-32-karakter-uzunlukta-rastgele-string
⚠️ Güçlü bir secret oluşturun (openssl rand -base64 32)
```

```
NEXTAUTH_URL
Değer: https://www.atolyem.net
⚠️ Domain'iniz tam olarak bu şekilde olmalı
```

```
CLOUDFLARE_ACCOUNT_ID
Değer: Cloudflare Dashboard'dan Account ID
```

```
CLOUDFLARE_ACCOUNT_HASH
Değer: Cloudflare Images > Settings > Account Hash
```

```
CLOUDFLARE_IMAGES_API_TOKEN
Değer: Cloudflare API Token (Cloudflare Images:Edit yetkili)
```

```
CLOUDFLARE_IMAGES_VARIANT
Değer: public
```

### 2. Build Command Kontrolü

Vercel Dashboard > Settings > General > Build & Development Settings

**Build Command** şu şekilde olmalı:
```bash
prisma generate && prisma migrate deploy && next build
```

⚠️ **Not:** `package.json`'da build command zaten güncellendi, ama Vercel'de override edilmiş olabilir. Kontrol edin.

### 3. Database Migration

Production database'inizde migration'ların uygulanmış olduğundan emin olun:

```bash
# Lokal olarak production database URL'inizi kullanarak:
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

### 4. Redeploy

1. Environment variables'ları ekledikten sonra
2. Vercel Dashboard > Deployments
3. Son deployment'ın yanındaki "..." menüsünden **Redeploy** seçin
4. Veya yeni bir commit push edin

### 5. Test

Deploy sonrası şu URL'yi kontrol edin:
```
https://www.atolyem.net/api/health
```

Bu endpoint database bağlantısını test eder ve hata mesajı gösterir.

## 🔧 Yapılan Düzeltmeler

1. ✅ `/artists` sayfası dynamic yapıldı (build sırasında prerender edilmeyecek)
2. ✅ `package.json` build command'a `prisma migrate deploy` eklendi
3. ✅ Database bağlantı hataları için fallback mekanizmaları mevcut

## ⚠️ Önemli Notlar

- **DATABASE_URL** mutlaka Production environment için ayarlanmalı
- Database'iniz Vercel'in IP adreslerinden erişilebilir olmalı (firewall/IP whitelist)
- Migration'lar production database'de uygulanmış olmalı
- Tüm environment variables Production, Preview ve Development için ayrı ayrı ayarlanabilir

## 🐛 Hala Hata Alıyorsanız

1. Vercel Dashboard > Deployments > Son deployment > **Build Logs** kontrol edin
2. Vercel Dashboard > Deployments > Son deployment > **Runtime Logs** kontrol edin
3. `https://www.atolyem.net/api/health` endpoint'ini kontrol edin

