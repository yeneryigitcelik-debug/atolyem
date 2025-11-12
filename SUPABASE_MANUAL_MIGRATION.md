# Supabase Manuel Migration Rehberi

## 🎯 Sorun

Prisma migration'ları otomatik uygulanamıyor çünkü direct connection (port 5432) çalışmıyor.

## ✅ Çözüm: Manuel Migration

### Adım 1: Supabase SQL Editor'a Gidin

1. **Supabase Dashboard**'a gidin
2. Projenizi seçin
3. Sol menüden **SQL Editor** seçin
4. **New query** butonuna tıklayın

### Adım 2: Migration SQL'ini Çalıştırın

1. `supabase-all-migrations.sql` dosyasını açın
2. Tüm içeriği kopyalayın
3. Supabase SQL Editor'a yapıştırın
4. **Run** butonuna tıklayın (veya Ctrl+Enter)

### Adım 3: Sonuçları Kontrol Edin

1. **Table Editor** bölümüne gidin
2. Tabloların oluşturulduğunu kontrol edin:
   - ✅ User
   - ✅ Seller
   - ✅ Product
   - ✅ Order
   - ✅ Category
   - ✅ ve diğer tüm tablolar...

### Adım 4: Prisma Migration Tablosunu Oluşturun

Migration'ları Prisma'nın takip edebilmesi için:

```sql
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
```

Sonra migration kayıtlarını ekleyin:

```sql
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count")
VALUES 
    ('1', 'checksum1', NOW(), '20251105171918_add_variant_backref', NOW(), 1),
    ('2', 'checksum2', NOW(), '20251105183027_add_nextauth', NOW(), 1),
    ('3', 'checksum3', NOW(), '20251107160911_add_messaging', NOW(), 1),
    ('4', 'checksum4', NOW(), '20251107165245_add_marketplace_features', NOW(), 1),
    ('5', 'checksum5', NOW(), '20251107180000_add_marketplace_features', NOW(), 1);
```

## 🔄 Alternatif: Prisma db push

Eğer SQL Editor'dan çalıştırmak istemiyorsanız:

```powershell
# Connection pooling ile db push (schema'yı direkt uygular)
$env:DATABASE_URL="postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
npx prisma db push
```

⚠️ **Not:** `db push` migration geçmişini tutmaz, sadece schema'yı uygular.

## ✅ Sonuç

Migration'lar uygulandıktan sonra:
1. Vercel'de `DATABASE_URL` environment variable'ını ekleyin
2. Vercel'de redeploy yapın
3. `https://www.atolyem.net/api/health` endpoint'ini test edin

