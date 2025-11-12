# Prisma Studio Connection Sorunu - Çözüm

## 🔴 Sorun
Prisma Studio, connection pooling hostname'ine (`aws-1-ap-southeast-1.pooler.supabase.com:6543`) bağlanamıyor.

## ✅ Çözüm: Direct Connection String Kullanın

Prisma Studio ve local development için **direct connection** (port 5432) kullanın.
Connection pooling'i sadece **production** (Vercel) için kullanın.

### Adım 1: .env Dosyasını Güncelleyin

`.env` dosyanıza şu satırları ekleyin:

```env
# Connection pooling (Vercel production için)
DATABASE_URL="postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (Local development ve Prisma Studio için)
DIRECT_URL="postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@db.tlyuixjkgrpazfezqbxp.supabase.co:5432/postgres"
```

### Adım 2: prisma/schema.prisma Dosyasını Güncelleyin

`prisma/schema.prisma` dosyasında `directUrl` ekleyin:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")      // Connection pooling (production)
  directUrl = env("DIRECT_URL")       // Direct connection (local/Studio)
}
```

### Adım 3: Prisma Studio'yu Yeniden Başlatın

1. Prisma Studio'yu kapatın (Ctrl+C)
2. Tekrar başlatın: `npx prisma studio`

## 🔍 Alternatif: Sadece Direct Connection Kullanın

Eğer connection pooling sorun çıkarıyorsa, geçici olarak sadece direct connection kullanabilirsiniz:

### .env dosyası:
```env
# Direct connection (hem local hem production için)
DATABASE_URL="postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@db.tlyuixjkgrpazfezqbxp.supabase.co:5432/postgres"
```

### prisma/schema.prisma:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // directUrl kaldırıldı
}
```

**Not:** Direct connection, connection pooling'den daha fazla connection kullanır, ama Prisma Studio için sorun değil.

## ⚠️ Önemli Notlar

1. **Supabase Proje Durumu**: Projenizin **ACTIVE** olduğundan emin olun
2. **IP Whitelist**: Eğer Supabase'de IP whitelist varsa, local IP'nizi ekleyin
3. **Firewall**: Windows Firewall veya antivirüs programı port 5432'yi engelliyor olabilir

## 🚀 Vercel'de Çalışacak mı?

**EVET!** Vercel'de:
- Environment variable olarak `DATABASE_URL` (connection pooling) kullanılacak
- Build sırasında `prisma migrate deploy` çalışacak
- Production'da connection pooling kullanılacak

Local'de direct connection kullanmanız Vercel'i etkilemez.

## ✅ Test

1. `.env` dosyasını güncelleyin
2. `prisma/schema.prisma` dosyasını güncelleyin
3. `npx prisma generate` çalıştırın
4. `npx prisma studio` başlatın
5. Database'e bağlanabildiğinizi kontrol edin

