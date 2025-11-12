# Supabase Kurulum Rehberi

## 🎯 Neden Supabase?

Vercel'de production database olmadan uygulama çalışmaz. Supabase:
- ✅ Ücretsiz plan (500MB database, 2GB bandwidth)
- ✅ Vercel ile entegrasyon
- ✅ PostgreSQL (Prisma ile uyumlu)
- ✅ Kolay kurulum

## 📋 Adım 1: Supabase Hesabı Oluşturma

1. **Supabase'e gidin**: https://supabase.com
2. **Sign Up** veya **Sign In** yapın (GitHub ile giriş yapabilirsiniz)
3. **New Project** butonuna tıklayın

## 📋 Adım 2: Yeni Proje Oluşturma

1. **Organization**: Yeni bir organization oluşturun veya mevcut olanı seçin
2. **Project Name**: `atolyem` (veya istediğiniz isim)
3. **Database Password**: Güçlü bir parola oluşturun (kaydedin!)
4. **Region**: En yakın bölgeyi seçin (örn: `West Europe` - Frankfurt)
5. **Pricing Plan**: Free plan seçin
6. **Create new project** butonuna tıklayın

⏱️ **Not**: Proje oluşturma 1-2 dakika sürebilir.

## 📋 Adım 3: Database Connection String'i Alma

1. Supabase Dashboard'da projenize gidin
2. Sol menüden **Settings** (⚙️) > **Database** seçin
3. **Connection string** bölümüne gidin
4. **Connection pooling** sekmesini seçin (Vercel için önerilen)
5. **URI** formatını seçin
6. Connection string'i kopyalayın:

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Örnek:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

⚠️ **Önemli**: 
- `[YOUR-PASSWORD]` kısmını proje oluştururken belirlediğiniz parola ile değiştirin
- Connection pooling kullanın (Vercel serverless için önemli)

## 📋 Adım 4: Vercel'de Environment Variable Ayarlama

1. **Vercel Dashboard**'a gidin: https://vercel.com/dashboard
2. Projenizi seçin
3. **Settings** > **Environment Variables** bölümüne gidin
4. Yeni variable ekleyin:

**Key:**
```
DATABASE_URL
```

**Value:**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Environment:**
- ✅ Production
- ✅ Preview  
- ✅ Development (opsiyonel)

5. **Save** butonuna tıklayın

## 📋 Adım 5: Migration'ları Production Database'e Uygulama

### Yöntem 1: Lokal olarak (Önerilen)

1. Supabase'den aldığınız connection string'i kullanın:

```powershell
# .env.production dosyası oluşturun (veya direkt komut satırında)
$env:DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migration'ları uygula
npx prisma migrate deploy
```

### Yöntem 2: Vercel Build Command (Otomatik)

Vercel Dashboard > Settings > General > Build & Development Settings

**Build Command** şu şekilde olmalı (zaten güncellendi):
```bash
prisma generate && prisma migrate deploy && next build
```

Bu sayede her deploy'da migration'lar otomatik uygulanır.

## 📋 Adım 6: Database Schema'yı Kontrol Etme

1. Supabase Dashboard > **Table Editor** bölümüne gidin
2. Tablolarınızın oluşturulduğunu kontrol edin:
   - User
   - Seller
   - Product
   - Order
   - Category
   - vb.

## 📋 Adım 7: Test Etme

### Lokal Test

```powershell
# Production database URL'i ile test
$env:DATABASE_URL="your-supabase-connection-string"
npx prisma studio
```

### Vercel Deploy Sonrası

1. Vercel'de redeploy yapın
2. Şu URL'yi kontrol edin:
   ```
   https://www.atolyem.net/api/health
   ```
3. Response'da `"database": "connected"` görünmeli

## 🔒 Güvenlik Notları

1. **Database Password**: Güçlü bir parola kullanın ve güvenli bir yerde saklayın
2. **Connection String**: `.env` dosyasını git'e commit etmeyin (zaten `.gitignore`'da)
3. **Row Level Security (RLS)**: Supabase'de RLS aktif, Prisma kullanıyorsanız genellikle kapalı tutabilirsiniz
4. **IP Restrictions**: Supabase free plan'da IP restriction yok, production'da gerekirse upgrade edin

## 🆓 Supabase Free Plan Limitleri

- **Database Size**: 500 MB
- **Bandwidth**: 2 GB/month
- **API Requests**: 50,000/month
- **Realtime Connections**: 200 concurrent
- **File Storage**: 1 GB

Küçük-orta ölçekli projeler için yeterli.

## 🔄 Alternatif Database Servisleri

Supabase yerine şunları da kullanabilirsiniz:

1. **Neon** (https://neon.tech)
   - Serverless PostgreSQL
   - Ücretsiz plan: 0.5 GB storage
   - Vercel ile iyi entegrasyon

2. **Railway** (https://railway.app)
   - PostgreSQL + diğer servisler
   - Ücretsiz plan: $5 kredi/ay

3. **PlanetScale** (MySQL)
   - MySQL (Prisma ile uyumlu)
   - Ücretsiz plan mevcut

## 🐛 Sorun Giderme

### "Can't reach database server" hatası

1. Connection string'in doğru olduğundan emin olun
2. Password'un doğru olduğundan emin olun
3. Connection pooling kullandığınızdan emin olun (`pgbouncer=true`)

### Migration hataları

1. Supabase Dashboard > **SQL Editor**'dan manuel migration çalıştırabilirsiniz
2. Veya `prisma db push` kullanın (development için)

### Connection timeout

1. Connection pooling kullandığınızdan emin olun
2. Supabase Dashboard > Settings > Database > Connection Pooling aktif mi kontrol edin

## ✅ Kontrol Listesi

- [ ] Supabase hesabı oluşturuldu
- [ ] Yeni proje oluşturuldu
- [ ] Database password kaydedildi
- [ ] Connection string kopyalandı
- [ ] Vercel'de DATABASE_URL environment variable eklendi
- [ ] Migration'lar production database'e uygulandı
- [ ] Health check endpoint test edildi
- [ ] Vercel'de redeploy yapıldı

## 📚 Kaynaklar

- Supabase Docs: https://supabase.com/docs
- Prisma + Supabase: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-supabase
- Vercel + Supabase: https://vercel.com/guides/nextjs-prisma-postgres

