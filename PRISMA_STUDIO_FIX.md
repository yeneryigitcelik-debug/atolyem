# Prisma Studio Connection Sorunu - Hızlı Çözüm

## 🔴 Sorun
Prisma Studio, connection pooling'e bağlanamıyor ve şu hatayı veriyor:
```
Can't reach database server at `aws-1-ap-southeast-1.pooler.supabase.com:6543`
```

## ✅ Çözüm (3 Adım)

### Adım 1: Prisma Studio'yu Kapatın
- Prisma Studio çalışıyorsa, terminal'de **Ctrl+C** ile kapatın

### Adım 2: .env Dosyasına DIRECT_URL Ekleyin

`.env` dosyanızı açın ve şu satırı ekleyin:

```env
# Connection pooling (Vercel production için - zaten var)
DATABASE_URL="postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (Local development ve Prisma Studio için - YENİ EKLEYİN)
DIRECT_URL="postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@db.tlyuixjkgrpazfezqbxp.supabase.co:5432/postgres"
```

### Adım 3: Prisma Client'ı Yeniden Oluşturun

Terminal'de şu komutları çalıştırın:

```bash
npx prisma generate
npx prisma studio
```

## ✅ Sonuç

- Prisma Studio artık **direct connection** (port 5432) kullanacak
- Local development çalışacak
- Vercel'de hala **connection pooling** (port 6543) kullanılacak

## 🔍 Nasıl Çalışıyor?

- **DATABASE_URL**: Connection pooling (Vercel production için)
- **DIRECT_URL**: Direct connection (Local/Prisma Studio için)
- Prisma, migrations ve Studio için `directUrl` kullanır
- Uygulama kodunda `DATABASE_URL` kullanılır

## ⚠️ Önemli Notlar

1. **Supabase Proje Durumu**: Projenizin **ACTIVE** olduğundan emin olun
2. **IP Whitelist**: Eğer Supabase'de IP whitelist varsa, local IP'nizi ekleyin
3. **Firewall**: Windows Firewall port 5432'yi engelliyor olabilir

## 🚀 Vercel'de Çalışacak mı?

**EVET!** Vercel'de:
- Environment variable olarak `DATABASE_URL` (connection pooling) kullanılacak
- `DIRECT_URL` sadece local development için
- Production'da connection pooling kullanılacak

