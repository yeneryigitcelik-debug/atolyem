# Supabase Kurulum Rehberi

## 1. Supabase Dashboard'a Giriş

1. https://supabase.com/dashboard adresine gidin
2. Giriş yapın veya hesap oluşturun
3. Yeni bir proje oluşturun veya mevcut projenizi seçin

## 2. API Bilgilerini Alma

1. Sol menüden **Project Settings** (⚙️) seçin
2. **API** sekmesine tıklayın
3. Şu bilgileri kopyalayın:

### Project URL
- **Project URL** → `.env.local` dosyasındaki `NEXT_PUBLIC_SUPABASE_URL` değerine yapıştırın
- Örnek: `https://abcdefghijklmnop.supabase.co`

### API Keys
- **anon public** key → `.env.local` dosyasındaki `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerine yapıştırın
- **service_role secret** key → `.env.local` dosyasındaki `SUPABASE_SERVICE_ROLE_KEY` değerine yapıştırın
  - ⚠️ Bu key gizli tutulmalı ve asla frontend'e açılmamalı!

## 3. Storage Bucket Kurulumu (Görsel Yükleme için GEREKLİ)

Görsel yüklemenin çalışması için Storage bucket'ları oluşturmanız gerekiyor:

### Yöntem 1: SQL Editor ile (Önerilen)
1. Supabase Dashboard → **SQL Editor** seçin
2. **New query** tıklayın
3. `supabase/sql/storage-setup.sql` dosyasındaki kodu kopyalayıp yapıştırın
4. **Run** butonuna tıklayın

### Yöntem 2: Manuel Oluşturma
1. Supabase Dashboard → **Storage** seçin
2. **New bucket** tıklayın
3. Şu bucket'ları oluşturun:

**listing-images bucket:**
- Name: `listing-images`
- Public bucket: ✅ Açık
- File size limit: 10MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

**profile-images bucket:**
- Name: `profile-images`
- Public bucket: ✅ Açık
- File size limit: 5MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

## 4. .env.local Dosyasını Güncelleme

`.env.local` dosyasını açın ve şu satırları güncelleyin:

```env
# Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co

# Supabase Anon Key (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (GIZLI - sadece server tarafında kullanılır)
# ⚠️ Bu key'i asla frontend kodunda kullanmayın!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Önemli Notlar:
- `service_role` key Dashboard → Project Settings → API → **service_role** (secret) bölümünden alınır
- Bu key veritabanına tam erişim sağlar, dikkatli kullanın
- Görsel yükleme için bu key **zorunludur**

## 4. Development Server'ı Yeniden Başlatma

`.env.local` dosyasını güncelledikten sonra:

1. Terminal'de `Ctrl + C` ile server'ı durdurun
2. `npm run dev` ile yeniden başlatın
3. Tarayıcıda `http://localhost:3000/hesap` sayfasına gidin
4. Kayıt olmayı tekrar deneyin

## 5. Sorun Giderme

### Hala "Failed to fetch" hatası alıyorsanız:

1. **Environment variable'ları kontrol edin:**
   ```bash
   # Terminal'de çalıştırın:
   node -e "console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)"
   ```

2. **Supabase projenizin aktif olduğundan emin olun:**
   - Dashboard'da projenizin durumu "Active" olmalı
   - Pause edilmiş projeler çalışmaz

3. **Network sorunlarını kontrol edin:**
   - Firewall veya VPN Supabase'e erişimi engelliyor olabilir
   - Tarayıcı console'da (F12) Network sekmesinde hata detaylarını kontrol edin

4. **CORS sorunları:**
   - Supabase Dashboard → Authentication → URL Configuration
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 6. Test

Kayıt olduktan sonra:
- Supabase Dashboard → Authentication → Users
- Yeni kullanıcıyı görmelisiniz
- E-posta doğrulama linki gönderilir (eğer etkinse)





