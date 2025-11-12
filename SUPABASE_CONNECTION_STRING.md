# Supabase Connection String Nasıl Alınır?

## 📋 Connection Pooling String'i Alma

1. **Supabase Dashboard**'a gidin
2. Projenizi seçin
3. Sol menüden **Settings** (⚙️) > **Database** seçin
4. Sayfayı aşağı kaydırın, **"Connection string"** bölümünü bulun
5. **"Connection pooling"** sekmesini seçin (varsayılan olarak "URI" sekmesi açık olabilir)
6. **"URI"** formatını seçin
7. Connection string'i kopyalayın

## 🔍 Connection String Formatı

Connection pooling string'i şu formatta olmalı:

```
postgresql://postgres.tlyuixjkgrpazfezqbxp:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Örnek:**
```
postgresql://postgres.tlyuixjkgrpazfezqbxp:Dhejdu89475869..@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## ⚠️ Önemli Notlar

- **Port 6543** kullanılmalı (connection pooling için)
- **Port 5432** direct connection'dır (bazen çalışmaz)
- `[YOUR-PASSWORD]` kısmını Supabase database password'unuz ile değiştirin
- `[REGION]` kısmı otomatik olarak connection string'de olacak (örn: `eu-central-1`, `us-east-1`)

## 🔄 Eğer Connection String Bulamazsanız

1. **Settings > Database** sayfasında **"Connection string"** başlığını arayın
2. Bazen sayfanın alt kısmında olabilir, aşağı kaydırın
3. **"URI"**, **"JDBC"**, **"Golang"** gibi sekmeler olabilir - **"URI"** sekmesini seçin
4. **"Connection pooling"** ve **"Direct connection"** sekmeleri olabilir - **"Connection pooling"** sekmesini seçin

## 📝 .env Dosyasına Ekleme

Connection string'i aldıktan sonra `.env` dosyanıza ekleyin:

```env
DATABASE_URL="postgresql://postgres.tlyuixjkgrpazfezqbxp:YOUR-PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Password'u değiştirmeyi unutmayın!

