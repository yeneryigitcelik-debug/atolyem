This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Atolyem

Modern, ölçeklenebilir bir **sanat/eli işi pazaryeri**. Next.js (App Router) + Prisma + PostgreSQL temelinde; satıcı/ürün/variant/sepet/sipariş akışlarını içerir. Bu README kurulumdan mimariye, veri şemasından yol haritasına kadar **tek kaynak** olarak düşünülmüştür.

---

## İçindekiler

* [Özet](#özet)
* [Özellikler](#özellikler)
* [Teknolojiler](#teknolojiler)
* [Mimari ve Akışlar](#mimari-ve-akışlar)
* [Veri Modeli (Prisma)](#veri-modeli-prisma)
* [Geliştirme Ortamı Kurulumu](#geliştirme-ortamı-kurulumu)
* [PostgreSQL Kurulumu ve Kontroller](#postgresql-kurulumu-ve-kontroller)
* [Çevre Değişkenleri (.env)](#çevre-değişkenleri-env)
* [Prisma Komutları ve Seed](#prisma-komutları-ve-seed)
* [Çalıştırma Komutları](#çalıştırma-komutları)
* [Dizin Yapısı](#dizin-yapısı)
* [Güvenlik (KVKK) ve Loglama](#güvenlik-kvkk-ve-loglama)
* [Deployment (Vercel) & DB Yedekleri](#deployment-vercel--db-yedekleri)
* [Yol Haritası](#yol-haritası)
* [Sık Hatalar / Çözüm](#sık-hatalar--çözüm)
* [Katkı Rehberi](#katkı-rehberi)

---

## Özet

Atolyem, satıcıların ürün listeleyebildiği; kullanıcıların kategori, filtre ve arama ile ürün bulup satın alabildiği **Türkiye odaklı** bir pazar yeri uygulamasıdır. TR ödeme altyapıları (iyzico/PayTR) ve KVKK uyumuna odaklanır.

---

## Özellikler

* Satıcı yönetimi (komisyon bps bazlı)
* Kategori → Ürün → Variant (SKU/stock/price/attributes)
* Sepet ve sipariş akışı (OrderStatus: CART→PAID→SHIPPED→COMPLETED)
* Admin mini-panel: kategori/ürün/variant CRUD, görsel yükleme
* Rol tabanlı erişim (ADMIN/SELLER/CUSTOMER)
* Next/Image ile görsel optimizasyonu, WebP
* Planlanan: TR ödeme entegrasyonu, kargo etiketi & takip, arama (TSVECTOR/Meilisearch), SEO + Sitemap + Structured Data

---

## Teknolojiler

* **Next.js (App Router, TypeScript, Tailwind)**
* **Prisma ORM** + **PostgreSQL**
* **NextAuth** (Credentials) – dev için basit giriş
* **Zod** (validasyon), **bcrypt** (pw hash), **JWT** (opsiyonel)

---

## Mimari ve Akışlar

* **Kullanıcı & Rol**: User → role (ADMIN/SELLER/CUSTOMER). Seller, User ile 1-1 bağlı.
* **Katalog**: Category (ağaç) → Product → Variant (fiyat/stock/SKU/attributes)
* **Sepet/Sipariş**: Order (CART/PENDING/PAID/SHIPPED/COMPLETED/CANCELED) + OrderItem
* **Ödeme (plan)**: iyzico/PayTR sandbox → webhook ile siparişi PAID’e al.
* **Payout (plan)**: Seller komisyon kapanışı ve ödeme kayıtları.

Akış örneği: Kullanıcı ürünü seçer → variant belirler → sepete ekler → ödeme → sipariş PAID → kargo etiketi → SHIPPED → teslim → COMPLETED.

---

## Veri Modeli (Prisma)

Özet (tam şema `prisma/schema.prisma`):

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  hashedPw  String
  role      UserRole @default(CUSTOMER)
  seller    Seller?
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Seller {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  displayName  String
  commissionBps Int     @default(1500) // %15 = 1500 bps
  products     Product[]
  payouts      Payout[]
  createdAt    DateTime @default(now())
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  parentId  String?
  children  Category[] @relation("CategoryToCategory")
  parent    Category?  @relation("CategoryToCategory", fields: [parentId], references: [id])
  products  Product[]
}

model Product {
  id          String    @id @default(cuid())
  sellerId    String
  seller      Seller    @relation(fields: [sellerId], references: [id])
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  title       String
  slug        String    @unique
  description String?
  images      ProductImage[]
  variants    Variant[]
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  url       String
  alt       String?
  sort      Int      @default(0)
  product   Product  @relation(fields: [productId], references: [id])
}

model Variant {
  id         String  @id @default(cuid())
  productId  String
  sku        String  @unique
  priceCents Int
  stock      Int     @default(0)
  attributes Json?
  product    Product @relation(fields: [productId], references: [id])
}

model Order {
  id         String       @id @default(cuid())
  userId     String
  status     OrderStatus  @default(CART)
  items      OrderItem[]
  totalCents Int          @default(0)
  createdAt  DateTime     @default(now())
  user       User         @relation(fields: [userId], references: [id])
}

model OrderItem {
  id         String  @id @default(cuid())
  orderId    String
  variantId  String
  qty        Int     @default(1)
  priceCents Int
  order      Order   @relation(fields: [orderId], references: [id])
  variant    Variant @relation(fields: [variantId], references: [id])
}

model Payout {
  id          String  @id @default(cuid())
  sellerId    String
  amountCents Int
  note        String?
  createdAt   DateTime @default(now())
  seller      Seller   @relation(fields: [sellerId], references: [id])
}

enum UserRole { ADMIN SELLER CUSTOMER }

enum OrderStatus { CART PENDING PAID SHIPPED COMPLETED CANCELED }
```

---

## Geliştirme Ortamı Kurulumu

> Aşağıdaki komutlar Windows/PowerShell içindir. Her komutun altında **ne yaptığı** kısaca açıklanmıştır.

```powershell
npx create-next-app@latest atolyem --ts --eslint --app --tailwind
```

* Yeni Next.js (App Router) projesi oluşturur; TypeScript, ESLint, Tailwind hazır gelir.

```powershell
cd atolyem
```

* Proje klasörüne geçer.

```powershell
npm i prisma @prisma/client zod bcrypt jsonwebtoken next-auth
```

* ORM (Prisma), client, validasyon ve auth bağımlılıklarını yükler.

```powershell
npx prisma init
```

* `prisma/` klasörünü ve `.env` dosyasını oluşturur.

---

## PostgreSQL Kurulumu ve Kontroller

**Kurulum (Winget):**

```powershell
winget install -e --id PostgreSQL.PostgreSQL
```

* Postgres 17 kurulumunu başlatır (sihirbazda parola & PATH ekleme seç).

**Hizmet/Port/İstemci kontrolü:**

```powershell
Get-Service *postgres*               # Yüklü Postgres servislerini listeler.
Get-NetTCPConnection -LocalPort 5432 # 5432 portu dinleniyor mu bakar.
psql --version                       # psql istemcisi PATH’te mi kontrol eder.
```

**İlk cluster (gerekiyorsa):**

```powershell
& "C:\Program Files\PostgreSQL\17\bin\initdb.exe" -D "C:\Postgres\data" -U postgres -W -E UTF8 --locale=en_US
```

* Yeni veritabanı cluster’ı başlatır.

**Servisi başlatma / log görme:**

```powershell
Start-Service postgresql-17
Get-Service postgresql-17
& "C:\Program Files\PostgreSQL\17\bin\postgres.exe" -D "C:\Postgres\data"   # Hata varsa konsola düşer.
```

> **İzin sorunu**: `icacls "C:\Postgres\data" /grant "NT AUTHORITY\SYSTEM:(OI)(CI)(F)" /T`

---

## Çevre Değişkenleri (.env)

Örnek `.env`:

```ini
DATABASE_URL="postgresql://atolyem:atolyem123@localhost:5432/atolyem?schema=public"
NEXTAUTH_SECRET="dev-only-change-me"
NEXTAUTH_URL="http://localhost:3000"
```

* `DATABASE_URL`: Postgres bağlantı dizesi
* `NEXTAUTH_SECRET`: JWT/Session imzalama gizli anahtarı
* `NEXTAUTH_URL`: Auth callback tabanı

---

## Prisma Komutları ve Seed

```powershell
npx prisma migrate dev --name init
```

* Şemayı DB’ye uygular, migration oluşturur.

```powershell
npx prisma db seed
```

* `prisma/seed.ts` çalışır; örnek veri/hesap ekler.

### Minimal `prisma/seed.ts`

```ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  await db.category.upsert({
    where: { slug: "resim" },
    update: {},
    create: { name: "Resim", slug: "resim" },
  });

  await db.user.upsert({
    where: { email: "admin@atolyem.local" },
    update: {},
    create: {
      email: "admin@atolyem.local",
      name: "Admin",
      hashedPw: "DEVHASH", // Geliştirmede bcrypt ile değiştirilecek
      role: "ADMIN",
    },
  });
}

main().finally(() => db.$disconnect());
```

* Kategori ve admin kullanıcıyı yaratır (parola hash’i dev’de güncellenecek).

---

## Çalıştırma Komutları

```powershell
npm run dev
```

* Geliştirme sunucusunu başlatır (`http://localhost:3000`).

```powershell
npx prisma studio
```

* Tarayıcıda görsel DB yöneticisini açar.

```powershell
npx prisma migrate status
```

* DB bağlantısı ve migration durumunu raporlar.

---

## Dizin Yapısı

```
atolyem/
  app/                 # App Router sayfaları (admin, mağaza, auth)
  components/          # UI bileşenleri
  lib/                 # yardımcılar (auth, db client, validations)
  prisma/
    schema.prisma      # veri modeli
    migrations/        # migration dosyaları
    seed.ts            # örnek veri
  public/uploads/      # dev ortamı görselleri (prod: object storage)
```

---

## Güvenlik (KVKK) ve Loglama

* Kullanıcı/sipariş verilerinde **minimize et** ve **amaç bağlılığı**.
* Parolalar `bcrypt` ile hashlenir; hassas alanlar için **at-rest** şifreleme planlanır.
* Erişim logları ve kritik işlemler için denetim izleri (audit) tutulur.
* Prod’da ayrı DB kullanıcı rolleri: `app_ro`, `app_rw`, `admin`.

---

## Deployment (Vercel) & DB Yedekleri

* **Vercel**: Next.js için uygundur; `DATABASE_URL` prod’a özel olmalı.
* **DB**: Managed Postgres (Neon, Supabase, RDS) tercih edilir; günlük yedek, PITR.
* **CD**: PR merge → otomatik deploy; şema değişikliğinde `prisma migrate deploy`.

---

## Yol Haritası

**P0 (çekirdek)**

* Auth (Credentials), rol korumalı admin/seller alanları
* Kategori/Ürün/Variant CRUD, görsel yükleme
* Sepet ve sipariş temel akışı

**P1 (haftalık)**

* Arama & filtre (TSVECTOR/Meilisearch)
* Ödeme (iyzico/PayTR sandbox) + webhook
* Satıcı paneli v1 (satış/komisyon raporları)
* Kargo entegrasyon planı (PTT, Yurtiçi)

**P2**

* Fatura/KDV, komisyon kapanışı & payout
* SEO + Analytics (Plausible)
* KVKK süreçleri, veri saklama politikası, yedek & rotasyon
* CI/CD iyileştirmeleri

---

## Sık Hatalar / Çözüm

* **Servis açılmıyor (Windows):** `postgres.exe -D C:\Postgres\data` ile foreground hata mesajını gör; çoğunlukla izin/port/başlatılmamış cluster.
* **Port 5432 dolu:** `Get-NetTCPConnection -LocalPort 5432` ile hangi PID → portu değiştir (`postgresql.conf: port = 5433`).
* **Stale postmaster.pid:** `Remove-Item ...\postmaster.pid -Force` → sonra tekrar başlat.
* **Prisma bağlantı hatası:** `.env` `DATABASE_URL` doğru mu? Sunucu çalışıyor mu? `npx prisma migrate status` hata mesajını izle.

---

## Katkı Rehberi

1. Issue aç, küçük PR’lar gönder.
2. Kod stili: ESLint + Prettier.
3. Şema değişikliklerinde: `npx prisma migrate dev` ve PR’a migration’ı ekle.
4. Güvenlik/performans ile ilgili PR’larda ölçüm/kanıt ekle.

---

**Lisans**: Proje sahibinin tercihine göre belirlenecek.
