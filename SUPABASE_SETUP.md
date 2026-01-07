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
- Bu key uzun bir JWT token gibi görünür (200+ karakter)

## 3. .env.local Dosyasını Güncelleme

`.env.local` dosyasını açın ve şu satırları güncelleyin:

```env
# Bu satırı güncelleyin:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
# ↓ Şöyle olmalı:
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co

# Bu satırı güncelleyin:
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
# ↓ Şöyle olmalı (çok uzun bir token):
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

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


