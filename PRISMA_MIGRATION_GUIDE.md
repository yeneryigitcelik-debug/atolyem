# Prisma Migration Kullanım Rehberi

## 🎯 Prisma Migration Nedir?

Prisma migration'ları, database schema'nızı (tablolar, kolonlar, ilişkiler) otomatik olarak oluşturan SQL dosyalarıdır. Manuel tablo oluşturmanıza gerek kalmaz!

## 📋 Adım 1: Supabase Connection String'i Alın

1. Supabase Dashboard'a gidin
2. Projenizi seçin
3. **Settings** > **Database** bölümüne gidin
4. **Connection string** bölümünde **Connection pooling** sekmesini seçin
5. **URI** formatını seçin
6. Connection string'i kopyalayın:

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

⚠️ **Önemli:** `[password]` kısmını proje oluştururken belirlediğiniz parola ile değiştirin!

## 📋 Adım 2: Migration'ları Supabase'e Uygulama

### Yöntem A: Otomatik Script ile (En Kolay!)

1. **PowerShell'i açın** ve proje klasörüne gidin:
```powershell
cd C:\Users\yyigi\Desktop\atolyem
```

2. **Script'i çalıştırın:**
```powershell
.\apply-migration.ps1
```

Script sizden password isteyecek ve migration'ları otomatik uygulayacak.

### Yöntem B: Manuel PowerShell ile

1. **Terminal'i açın** ve proje klasörüne gidin:
```powershell
cd C:\Users\yyigi\Desktop\atolyem
```

2. **Supabase connection string'i environment variable olarak ayarlayın:**
```powershell
# Direct connection (migration için)
$env:DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.tlyuixjkgrpazfezqbxp.supabase.co:5432/postgres"

# Veya Connection pooling (Vercel için önerilen)
$env:DATABASE_URL="postgresql://postgres.tlyuixjkgrpazfezqbxp:YOUR-PASSWORD@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

⚠️ **Yukarıdaki connection string'de `YOUR-PASSWORD` kısmını Supabase database password'unuz ile değiştirin!**

3. **Migration'ları uygulayın:**
```powershell
npx prisma migrate deploy
```

Bu komut:
- ✅ Tüm migration dosyalarını okur
- ✅ Supabase database'ine uygular
- ✅ Tüm tabloları, kolonları, ilişkileri oluşturur
- ✅ Index'leri ve constraint'leri ekler

### Yöntem B: .env Dosyası ile

1. Proje klasöründe `.env.production` dosyası oluşturun (veya mevcut `.env` dosyasını kullanın)

2. Supabase connection string'i ekleyin:
```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:YOUR-PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

3. Migration'ları uygulayın:
```powershell
npx prisma migrate deploy
```

## 📋 Adım 3: Sonuçları Kontrol Etme

### Supabase Dashboard'dan Kontrol

1. Supabase Dashboard > **Table Editor** bölümüne gidin
2. Tablolarınızın oluşturulduğunu görmelisiniz:
   - ✅ User
   - ✅ Seller
   - ✅ Product
   - ✅ Order
   - ✅ Category
   - ✅ ve diğer tüm tablolar...

### Prisma Studio ile Kontrol

```powershell
# Supabase connection string'i ayarlayın
$env:DATABASE_URL="your-supabase-connection-string"

# Prisma Studio'yu açın
npx prisma studio
```

Bu komut tarayıcıda görsel bir database yöneticisi açar.

## 📋 Adım 4: Vercel'e Environment Variable Ekleme

Migration'ları uyguladıktan sonra, Vercel'de de aynı connection string'i eklemeniz gerekiyor:

1. **Vercel Dashboard** > Projeniz > **Settings** > **Environment Variables**
2. **DATABASE_URL** ekleyin:
   - Key: `DATABASE_URL`
   - Value: Supabase connection string'iniz
   - Environment: ✅ Production, ✅ Preview, ✅ Development

3. **Redeploy** yapın

## 🔧 Yaygın Komutlar

### Migration Durumunu Kontrol Etme
```powershell
$env:DATABASE_URL="your-supabase-connection-string"
npx prisma migrate status
```

### Migration'ları Uygulama
```powershell
$env:DATABASE_URL="your-supabase-connection-string"
npx prisma migrate deploy
```

### Prisma Client'ı Generate Etme
```powershell
npx prisma generate
```

### Database Schema'yı Görselleştirme
```powershell
$env:DATABASE_URL="your-supabase-connection-string"
npx prisma studio
```

### Database Schema'yı Database'e Push Etme (Development için)
```powershell
$env:DATABASE_URL="your-supabase-connection-string"
npx prisma db push
```

⚠️ **Not:** `db push` sadece development için. Production'da `migrate deploy` kullanın!

## 🐛 Sorun Giderme

### "Can't reach database server" hatası

1. Connection string'in doğru olduğundan emin olun
2. Password'un doğru olduğundan emin olun
3. Connection pooling kullandığınızdan emin olun (`pgbouncer=true`)

### "Migration already applied" hatası

Bu normal! Migration zaten uygulanmış demektir. Devam edebilirsiniz.

### "Migration failed" hatası

1. Supabase Dashboard > **SQL Editor** bölümüne gidin
2. Hata mesajını kontrol edin
3. Gerekirse manuel SQL çalıştırın

## ✅ Kontrol Listesi

- [ ] Supabase connection string'i alındı
- [ ] Connection string'de password değiştirildi
- [ ] `npx prisma migrate deploy` komutu çalıştırıldı
- [ ] Supabase Table Editor'da tablolar görünüyor
- [ ] Vercel'de DATABASE_URL environment variable eklendi
- [ ] Vercel'de redeploy yapıldı

## 📚 Daha Fazla Bilgi

- Prisma Migration Docs: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Supabase + Prisma: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-supabase

