# 🚨 Vercel Hata Düzeltme - HEMEN YAPILACAKLAR

## 🔴 Sorun: "Application error"

Site deploy edildi ama çalışmıyor. Bu genellikle **eksik environment variables** nedeniyle olur.

## ✅ ÇÖZÜM: Vercel'de Environment Variables Ekleme

### Adım 1: Vercel Dashboard'a Gidin

1. https://vercel.com/dashboard
2. Projenizi seçin
3. **Settings** > **Environment Variables**

### Adım 2: Şu Değişkenleri EKLEYİN (Production için)

#### 1. DATABASE_URL (ZORUNLU!)
```
Key: DATABASE_URL
Value: postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
Environment: ✅ Production
```

#### 2. NEXTAUTH_SECRET (ZORUNLU!)
```
Key: NEXTAUTH_SECRET
Value: [Aşağıdaki PowerShell komutunu çalıştırın, oluşturulan değeri kullanın]
Environment: ✅ Production
```

PowerShell'de NEXTAUTH_SECRET oluşturma:
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

#### 3. NEXTAUTH_URL (ZORUNLU!)
```
Key: NEXTAUTH_URL
Value: https://www.atolyem.net
Environment: ✅ Production
```

#### 4. CLOUDFLARE_ACCOUNT_ID
```
Key: CLOUDFLARE_ACCOUNT_ID
Value: [Cloudflare Dashboard'dan Account ID]
Environment: ✅ Production
```

#### 5. CLOUDFLARE_ACCOUNT_HASH
```
Key: CLOUDFLARE_ACCOUNT_HASH
Value: [Cloudflare Images > Settings > Account Hash]
Environment: ✅ Production
```

#### 6. CLOUDFLARE_IMAGES_API_TOKEN
```
Key: CLOUDFLARE_IMAGES_API_TOKEN
Value: [Cloudflare API Token]
Environment: ✅ Production
```

#### 7. CLOUDFLARE_IMAGES_VARIANT
```
Key: CLOUDFLARE_IMAGES_VARIANT
Value: public
Environment: ✅ Production
```

### Adım 3: Redeploy

1. Tüm environment variables'ları ekledikten sonra
2. Vercel Dashboard > **Deployments**
3. Son deployment'ın yanındaki **"..."** menüsünden **Redeploy** seçin
4. Veya yeni bir commit push edin

### Adım 4: Test

Deploy tamamlandıktan sonra:
- Ana sayfa: `https://www.atolyem.net`
- Health check: `https://www.atolyem.net/api/health`

## ⚠️ ÖNEMLİ NOTLAR

1. **DATABASE_URL** mutlaka connection pooling string olmalı (port 6543)
2. **NEXTAUTH_SECRET** en az 32 karakter olmalı
3. **NEXTAUTH_URL** domain'inizle tam eşleşmeli
4. Her değişken **Production** environment için eklenmeli

## 🔍 Hata Devam Ederse

1. Vercel Dashboard > Deployments > Son deployment > **Runtime Logs** kontrol edin
2. Hata mesajını paylaşın
3. `https://www.atolyem.net/api/health` endpoint'ini test edin

