# Supabase Bağlantı Sorunu - Kontrol Listesi

## 🔍 Sorun
Prisma, connection pooling hostname'ine (`aws-1-ap-southeast-1.pooler.supabase.com:6543`) bağlanamıyor.

## ✅ Kontrol Edilmesi Gerekenler

### 1. Supabase Proje Durumu
1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. **Settings** > **General** bölümüne gidin
4. Proje durumunu kontrol edin:
   - ✅ **Active** olmalı
   - ❌ **Paused** ise, projeyi resume edin

### 2. Database Connection Settings
1. Supabase Dashboard > Projeniz > **Settings** > **Database**
2. **Connection string** bölümüne gidin
3. **Connection pooling** sekmesini seçin
4. Connection string'i kopyalayın ve `.env` dosyasına ekleyin

### 3. IP Whitelist (Eğer varsa)
1. Supabase Dashboard > Projeniz > **Settings** > **Database**
2. **Network restrictions** bölümünü kontrol edin
3. Eğer IP whitelist varsa, local IP'nizi ekleyin
4. Veya geçici olarak tüm IP'lere izin verin (development için)

### 4. Connection Pooling vs Direct Connection

**ÖNEMLİ:** Prisma migrations için connection pooling bazen sorun çıkarabilir.

#### Seçenek 1: Direct Connection (Migrations için)
`.env` dosyasına ekleyin:
```env
# Connection pooling (uygulama için)
DATABASE_URL="postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (migrations için)
DIRECT_URL="postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@db.tlyuixjkgrpazfezqbxp.supabase.co:5432/postgres"
```

`prisma/schema.prisma` dosyasını güncelleyin:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Migrations için
}
```

#### Seçenek 2: Sadece Connection Pooling (Önerilen)
Eğer Supabase projesi aktifse ve connection pooling çalışıyorsa, Vercel'de build sırasında çalışacaktır.

**Not:** Local'de Prisma migrations çalışmıyorsa, bu sorun değil. Vercel'de build sırasında çalışacak.

## 🚀 Vercel'de Çalışacak mı?

**EVET!** Vercel'de build sırasında:
1. `prisma generate` çalışır (schema'dan client oluşturur)
2. `prisma migrate deploy` çalışır (migrations uygular)
3. Vercel'in network'ü Supabase'e erişebilir

Local'de çalışmaması Vercel'de sorun olmayabilir.

## ✅ Test

Vercel'de deploy yaptıktan sonra:
1. Vercel Dashboard > Deployments > Son deployment > Build Logs
2. `prisma migrate deploy` komutunun başarılı olduğunu kontrol edin
3. Siteyi test edin: `https://www.atolyem.net/api/health`

