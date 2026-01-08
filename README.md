# Atölyem - Handmade Art Marketplace Backend

A production-grade, creator-first marketplace backend for handmade art and craft products in Turkey. Built with Next.js 15, Prisma, PostgreSQL, and TypeScript.

## 🎯 Project Vision

Atölyem is a curated marketplace for art & handmade goods (paintings, ceramics, prints, sculptures, crafts, limited editions, vintage art objects, creative supplies, and digital art assets). It is designed to be:

- **Creator-first**: Focus on shops, artist identity, storytelling
- **Trust & Integrity**: Domain rules enforced server-side
- **Extensible**: Future features won't require schema rewrites
- **Turkey-localized**: TRY currency, Turkish address format

## 🏗 Architecture

```
src/
├── app/api/               # Next.js API Routes
├── domain/                # Domain layer
│   ├── entities/          # Domain entities
│   ├── value-objects/     # Value objects (Money, Slug)
│   └── services/          # Domain services
├── application/           # Application layer
│   ├── use-cases/         # Use case handlers
│   └── integrity-rules/   # Business rule enforcement
├── infrastructure/        # Infrastructure layer
│   ├── database/          # Database client
│   ├── logging/           # Structured logging
│   └── payment/           # Payment provider interfaces
├── interface/             # Interface layer
│   ├── middleware/        # Request context, auth
│   └── validators/        # Zod schemas
├── lib/                   # Shared utilities
│   ├── api/               # Error handling, validation
│   ├── auth/              # Auth guards
│   ├── db/                # Prisma client
│   └── supabase/          # Supabase clients
└── tests/                 # Test suites
    ├── unit/              # Unit tests
    └── integration/       # Integration tests
```

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 7
- **Auth**: Supabase Auth
- **Validation**: Zod
- **Testing**: Vitest
- **Logging**: Structured JSON logs with requestId

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or Supabase account)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Copy environment file
copy .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run typecheck    # TypeScript type checking
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run migrations
```

### Production Setup - Database Connection Pooling

**⚠️ CRITICAL for Serverless Deployments (Vercel, etc.)**

When deploying to serverless environments, you **MUST** use Supabase's **Transaction Pooler** connection string instead of the direct connection.

#### Why?

Serverless functions create many concurrent connections. Using direct connections (port 5432) can exhaust your database connection limit and cause "Too many connections" errors.

#### How to Configure

1. **Get Transaction Pooler URL from Supabase Dashboard:**
   - Go to your Supabase project → Settings → Database
   - Find "Connection Pooling" section
   - Copy the **Session mode** connection string (port 6543)

2. **Update your `.env` file:**
   ```env
   # ✅ CORRECT - Transaction Pooler (for production/serverless)
   DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   
   # ❌ WRONG - Direct connection (only for local development)
   # DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   ```

3. **Note:** The Transaction Pooler connection string includes `?pgbouncer=true` parameter, which is required for proper connection pooling.

#### Local Development

For local development, you can use either:
- Direct connection (port 5432) - faster, fewer limitations
- Transaction Pooler (port 6543) - matches production environment

The code in `src/lib/db/prisma.ts` uses `Pool` from `pg` library, which works with both connection types.

## 🗄 Database Schema

### Core Models

| Model | Description |
|-------|-------------|
| `User` | Core user account linked to Supabase Auth |
| `SellerProfile` | Seller-specific data, payout info |
| `Shop` | Seller's storefront with branding |
| `ShopSection` | Groups of listings (like Etsy sections) |
| `Listing` | Product/listing with type, pricing, status |
| `ListingVariant` | Variations with price/stock overrides |
| `PersonalizationField` | Custom fields for buyer input |
| `DigitalAsset` | Digital files for download products |
| `Cart` / `CartItem` | Shopping cart |
| `Order` / `OrderItem` | Orders with snapshots |
| `Review` | Reviews tied to order items |
| `FavoriteListing` | User favorites |
| `FollowShop` | Shop follows |

### Listing Types (Etsy-inspired)

- `MADE_BY_SELLER` - Physical handmade by seller
- `DESIGNED_BY_SELLER` - Digital or print-on-demand
- `SOURCED_BY_SELLER` - Creative supplies
- `VINTAGE` - Items 20+ years old (requires evidence)

## 🔐 API Endpoints

### Authentication

All endpoints except public listings require Supabase Auth session.

### Seller/Shop

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/seller/onboard` | POST | Create seller profile + shop |
| `/api/seller/me` | GET | Get seller dashboard data |
| `/api/seller/orders` | GET | List seller's order items |

### Listings

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/listings` | POST | Create draft listing |
| `/api/listings` | GET | Search public listings |
| `/api/listings/:slug` | GET | Get listing details |
| `/api/listings/:slug` | PATCH | Update listing |
| `/api/listings/:slug/publish` | POST | Publish listing |
| `/api/listings/:slug/archive` | POST | Archive listing |

### Cart & Checkout

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cart` | GET | Get cart |
| `/api/cart` | POST | Add item to cart |
| `/api/cart/items/:id` | PATCH | Update cart item |
| `/api/cart/items/:id` | DELETE | Remove cart item |
| `/api/checkout` | POST | Create order (idempotent) |

### Orders

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | GET | List buyer's orders |
| `/api/purchases/:id/download` | GET | Download digital item |

### Social

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/favorites` | GET/POST/DELETE | Manage favorites |
| `/api/follow` | GET/POST/DELETE | Manage shop follows |
| `/api/reviews` | POST | Create review |

## 🛡 Integrity Rules (Edge Case Guardrails)

### Implemented Rules

| # | Rule | Status |
|---|------|--------|
| 1 | Self-purchase blocked (cart + checkout) | ✅ |
| 2 | Self-favorite blocked | ✅ |
| 3 | Self-follow blocked | ✅ |
| 4 | Only published listings visible publicly | ✅ |
| 5 | Draft/archived visible only to owner | ✅ |
| 6 | Private listings visible only to seller + granted buyer | ✅ |
| 7 | Stock decremented in transaction | ✅ |
| 8 | Insufficient stock blocks checkout | ✅ |
| 9 | Checkout idempotency via key | ✅ |
| 10 | Server calculates all totals | ✅ |
| 11 | Order items snapshot all data | ✅ |
| 12 | Tag limit = 13 per listing | ✅ |
| 13 | Slug unique + conflict resolution | ✅ |
| 14 | Slug locked after first publish | ✅ |
| 15 | Personalization validation | ✅ |
| 16 | Required personalization enforced | ✅ |
| 17 | Digital download count limit | ✅ |
| 18 | Digital download expiration | ✅ |
| 19 | Review eligibility window | ✅ |
| 20 | One review per order item | ✅ |
| 21 | Review only after delivery/download | ✅ |
| 22 | Vintage requires year evidence | ✅ |
| 23 | Listing must have stock > 0 to publish | ✅ |
| 24 | Archived/removed cannot be published | ✅ |
| 25 | Flagged listings not purchasable | ✅ |

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Coverage

- **Slug generation** - Turkish transliteration, uniqueness
- **Tag validation** - Limit, format, normalization
- **Ownership rules** - Self-purchase, self-favorite, self-follow
- **Personalization** - Required fields, length limits
- **Pricing** - Line items, subtotals, effective prices

## 🔒 Why the "Switch Button" is Frontend-Only

Users can be BUYER, SELLER, or BOTH. The UI may show a "mode switch" (buyer/seller dashboard), but:

1. **Capability** = What user is **allowed** to do (stored in `accountType`)
2. **Mode** = What user is **currently viewing** (UI preference only)

Security is enforced at:
- **API layer**: `requireBuyer()`, `requireSeller()` guards
- **Database layer**: RLS policies (when applied)

The mode switch is purely UI/UX convenience.

## 📋 Assumptions & Decisions

1. **Currency**: TRY default, stored as integers (kuruş)
2. **Payment**: Mocked - designed for sub-merchant integration later
3. **Digital delivery**: Supports instant + manual modes
4. **Reviews**: Window-based eligibility (60 days after delivery/download)
5. **Moderation**: `complianceStatus` field ready for admin workflows
6. **Categories**: Extensible with `CategoryAttribute` for per-category fields

## 🚧 Future Roadmap

- [ ] Premium seller tiers
- [ ] Auction listings
- [ ] Coupon/discount system
- [ ] AI price suggestions
- [ ] Editorial curation
- [ ] Real payment integration (iyzico, PayTR)
- [ ] Image upload to Supabase Storage
- [ ] Full-text search with Postgres

## 📄 License

Private - All rights reserved.

---

Built with ❤️ for Turkish artisans and makers.
