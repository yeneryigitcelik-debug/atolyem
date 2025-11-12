# Vercel Environment Variables - Değerler

## 🔴 KRİTİK: Bu değerleri Vercel'e ekleyin!

Vercel Dashboard > Projeniz > **Settings** > **Environment Variables** bölümüne gidin ve şu değişkenleri **Production** için ekleyin:

### 1. DATABASE_URL
```
postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. NEXTAUTH_SECRET
```
FCnjOxyxO7UjCHQ44DiTzHNoKTd6vYIh6h2MKUM6qS0=
```
⚠️ **Yukarıdaki değeri kullanın!** (Az önce oluşturuldu)

### 3. NEXTAUTH_URL
```
https://www.atolyem.net
```

### 4. CLOUDFLARE_ACCOUNT_ID
```
[Cloudflare Dashboard'dan Account ID'nizi buraya yazın]
```

### 5. CLOUDFLARE_ACCOUNT_HASH
```
[Cloudflare Images > Settings > Account Hash değerini buraya yazın]
```

### 6. CLOUDFLARE_IMAGES_API_TOKEN
```
[Cloudflare API Token'ınızı buraya yazın]
```

### 7. CLOUDFLARE_IMAGES_VARIANT
```
public
```

## 📋 Adım Adım

1. **Vercel Dashboard**'a gidin: https://vercel.com/dashboard
2. Projenizi seçin
3. **Settings** > **Environment Variables**
4. Her değişken için:
   - **Add New** butonuna tıklayın
   - **Key** kısmına değişken adını yazın
   - **Value** kısmına değeri yazın
   - **Environment** kısmında **Production** seçin
   - **Save** butonuna tıklayın

5. **Tüm değişkenleri ekledikten sonra:**
   - Vercel Dashboard > **Deployments**
   - Son deployment'ın yanındaki **"..."** menüsünden **Redeploy** seçin

## ✅ Kontrol

Deploy tamamlandıktan sonra:
- Ana sayfa: `https://www.atolyem.net`
- Health check: `https://www.atolyem.net/api/health`

## ⚠️ Önemli

- Her değişken **Production** environment için eklenmeli
- Değerler **tam olarak** yukarıdaki gibi olmalı (tırnak işareti olmadan)
- DATABASE_URL connection pooling string olmalı (port 6543)

