# Supabase Direct Connection Sorun Giderme

## ✅ Yapılan Düzeltme
- ✅ DIRECT_URL düzeltildi (kullanıcı adı: `postgres.tlyuixjkgrpazfezqbxp`)

## 🔴 Kalan Sorun
Network bağlantısı başarısız: `db.tlyuixjkgrpazfezqbxp.supabase.co:5432`

## 🔍 Kontrol Edilmesi Gerekenler

### 1. Supabase Proje Durumu (EN ÖNEMLİ!)

1. **Supabase Dashboard'a gidin:**
   - https://supabase.com/dashboard
   - Projenizi seçin

2. **Proje durumunu kontrol edin:**
   - **Settings** > **General**
   - Proje durumu **ACTIVE** olmalı
   - Eğer **PAUSED** ise, **Resume** butonuna tıklayın

3. **Proje aktif değilse:**
   - Projeyi resume edin
   - Birkaç dakika bekleyin (proje başlatılıyor)
   - Tekrar deneyin

### 2. Network Restrictions (IP Whitelist)

1. **Supabase Dashboard** > Projeniz > **Settings** > **Database**

2. **Network restrictions** bölümünü kontrol edin:
   - Eğer **IP whitelist** aktifse, local IP'nizi ekleyin
   - Veya geçici olarak tüm IP'lere izin verin (development için)

3. **Local IP'nizi öğrenmek için:**
   ```powershell
   ipconfig | Select-String "IPv4"
   ```

### 3. Firewall Kontrolü

Windows Firewall veya antivirüs programı port 5432'yi engelliyor olabilir:

1. **Windows Firewall:**
   - Control Panel > Windows Defender Firewall
   - Outbound rules kontrol edin
   - PostgreSQL veya port 5432 için rule ekleyin

2. **Antivirus:**
   - Geçici olarak kapatıp test edin
   - Veya PostgreSQL'i exception listesine ekleyin

### 4. Alternatif: Connection Pooling Kullanın

Eğer direct connection çalışmıyorsa, geçici olarak connection pooling kullanabilirsiniz:

**.env dosyasında:**
```env
# Connection pooling (hem local hem production için)
DATABASE_URL="postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# DIRECT_URL'i kaldırın veya yorum satırı yapın
# DIRECT_URL="..."
```

**prisma/schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // directUrl kaldırıldı - connection pooling kullanılıyor
}
```

**Not:** Connection pooling Prisma Studio'da bazı özelliklerle uyumsuz olabilir, ama genellikle çalışır.

## 🚀 Test Adımları

1. **Supabase projesinin ACTIVE olduğundan emin olun**
2. **Network restrictions kontrol edin**
3. **Prisma Studio'yu yeniden başlatın:**
   ```bash
   npx prisma studio
   ```

## ⚠️ Önemli Not

Eğer Supabase projesi **PAUSED** ise, direct connection çalışmaz. Projeyi **ACTIVE** hale getirmeniz gerekir.

## ✅ Vercel'de Çalışacak mı?

**EVET!** Vercel'de:
- Connection pooling kullanılacak (port 6543)
- Vercel'in network'ü Supabase'e erişebilir
- Production'da sorun olmayacak

Local'de direct connection çalışmıyorsa, Vercel'de sorun olmayabilir.

