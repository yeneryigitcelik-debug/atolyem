# Vercel Deploy Talimatları

## Vercel CLI ile Deploy

### 1. Login
```bash
cd C:\Users\yyigi\Desktop\atolyem
vercel login
```
Bu komutu çalıştırdığınızda:
- Bir URL açılacak (browser'da)
- Vercel'e GitHub ile giriş yapın
- "Verify" butonuna tıklayın
- Terminal'e dönün, onay mesajı gelecek

### 2. Deploy
```bash
vercel --prod
```

Bu komut:
- Projeyi build edecek
- Production'a deploy edecek
- Size bir URL verecek (örn: atolyem-xxx.vercel.app)

### 3. Environment Variables
Vercel dashboard'dan ekleyin:
https://vercel.com/[your-username]/atolyem/settings/environment-variables

Gerekli değişkenler:

```
DATABASE_URL=postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.tlyuixjkgrpazfezqbxp:gD2YlKbs9dHc7QY5@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
NEXTAUTH_SECRET=SG2x+4hZbYUWAlyCjqgbKwkB+jF6YbrXxkr3JQ8dqFs=
NEXTAUTH_URL=https://www.atolyem.net
CLOUDFLARE_ACCOUNT_ID=9ff6f544797f4e2c5dcf4d80440ac7ef
CLOUDFLARE_IMAGES_API_TOKEN=oRf7V1X-5BjXBx6_p3fY0GQpgeMH3MivBqoj_cEx
CLOUDFLARE_ACCOUNT_HASH=5uHlQDyzeO-VZtA207nD0w
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH=5uHlQDyzeO-VZtA207nD0w
CLOUDFLARE_IMAGES_VARIANT=public
NEXT_PUBLIC_BASE_URL=https://www.atolyem.net
```

### 4. Custom Domain
Dashboard'dan:
1. Settings → Domains
2. "Add Domain" → `www.atolyem.net`
3. DNS kayıtlarını güncelle:
   - CNAME: `www` → `cname.vercel-dns.com`

### 5. Tekrar Deploy (ENV ekledikten sonra)
```bash
vercel --prod
```

## Otomatik Deploy (GitHub Integration)

Alternatif olarak:
1. https://vercel.com/new adresine git
2. GitHub'dan atolyem repository'sini import et
3. Environment variables'ları ekle
4. Deploy et

Bundan sonra her `git push` otomatik deploy tetikleyecek.

## Build Komutları

Lokal test:
```bash
npm run build
npm start
```

Production build log'larını görmek için:
- Vercel dashboard → Deployments → Son deployment → View Build Logs
