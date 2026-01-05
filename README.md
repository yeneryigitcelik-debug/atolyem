# atolyem.net

A marketplace for handmade art and craft products. Built with Next.js 15, Prisma, PostgreSQL (Supabase), and TypeScript.

## Project Overview

atolyem.net is a platform where artisans can sell their handmade products. Users can be:

- **BUYER**: Can browse products, place orders, leave reviews
- **SELLER**: Can list products, manage inventory, fulfill orders
- **BOTH**: Full access to buyer and seller features

### Why the "Switch Button" is Frontend-Only

The "active mode" (buyer vs seller) is purely a **UI preference**, not a security control:

1. **Capability** = What the user is **allowed to do** (determined by `account_type: BUYER | SELLER | BOTH`)
2. **Mode** = What the user is **currently doing** (stored as `active_mode: buyer | seller` in preferences)

The switch button changes which dashboard/UI the user sees, but:
- A BUYER cannot perform seller actions regardless of UI mode
- A SELLER cannot perform buyer actions regardless of UI mode
- A BOTH user can do everything—the mode only affects which features are prominent in the UI

**Security is enforced at the API layer** (capability checks) and **database layer** (RLS policies), not by the UI mode toggle.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL (Supabase hosted)
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **Validation**: Zod
- **Styling**: Tailwind CSS

## Project Structure

```
atolyem/
├── prisma/
│   └── schema.prisma        # Database schema (source of truth)
├── src/
│   ├── app/
│   │   └── api/             # API route handlers
│   │       ├── me/          # User profile
│   │       ├── account/     # Account type and mode
│   │       ├── seller/      # Seller profile and orders
│   │       ├── products/    # Product CRUD
│   │       ├── orders/      # Order management
│   │       └── categories/  # Product categories
│   └── lib/
│       ├── supabase/        # Supabase clients
│       │   ├── server.ts    # Server-side (cookie-based)
│       │   ├── admin.ts     # Service role (privileged)
│       │   └── browser.ts   # Browser client
│       ├── auth/            # Auth utilities
│       │   ├── types.ts     # Type definitions
│       │   ├── requireUser.ts
│       │   └── requireCapability.ts
│       ├── api/             # API utilities
│       │   ├── errors.ts    # Error handling
│       │   └── validation.ts # Zod schemas
│       └── db/
│           └── prisma.ts    # Prisma client
└── supabase/
    └── sql/
        ├── init.sql         # Database initialization
        ├── rls.sql          # Row Level Security policies
        └── seed.sql         # Seed data (categories)
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase Postgres pooler connection string | Yes |
| `DIRECT_URL` | Supabase Postgres direct connection (for migrations) | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only!) | Yes |
| `APP_BASE_URL` | Application base URL | No (default: http://localhost:3000) |

## Setup Instructions

### 1. Install Dependencies

```bash
# Install all packages
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > Database** and copy connection strings
3. Go to **Settings > API** and copy the keys
4. Fill in `.env.local` with your values

### 3. Initialize Database

```bash
# Generate Prisma client (creates TypeScript types)
npm run db:generate

# Run migrations (creates all tables in your Supabase database)
npm run db:migrate
# When prompted, enter a name like "init"
```

> **Note**: Prisma 7 uses `prisma.config.ts` for database connection configuration.
> The DATABASE_URL from `.env.local` is automatically loaded via dotenv.

### 4. Apply RLS Policies

1. Go to Supabase Dashboard > SQL Editor
2. Run the contents of `supabase/sql/init.sql`
3. Run the contents of `supabase/sql/rls.sql`
4. (Optional) Run `supabase/sql/seed.sql` to add categories

### 5. Start Development Server

```bash
# Start the Next.js development server
npm run dev
```

The API is now available at `http://localhost:3000/api`.

## API Endpoints

### Authentication / User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me` | Get current user profile, preferences, and seller profile |

### Account Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/account/set-type` | Change account type (BUYER/SELLER/BOTH) |
| POST | `/api/account/set-mode` | Set active UI mode (buyer/seller) |

### Seller

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seller/profile` | Get seller profile |
| POST | `/api/seller/profile` | Create seller profile |
| PATCH | `/api/seller/profile` | Update seller profile |
| GET | `/api/seller/orders` | List order items for seller |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List seller's own products |
| POST | `/api/products` | Create a new product (DRAFT) |
| GET | `/api/products/:id` | Get product details |
| PATCH | `/api/products/:id` | Update product |
| POST | `/api/products/:id/publish` | Publish a product |
| GET | `/api/products/public` | List published products (public) |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List buyer's orders |
| POST | `/api/orders` | Create a new order |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category (for testing) |

## Example API Requests

### Get Current User

```bash
# Requires Supabase auth cookie
curl http://localhost:3000/api/me
```

### Upgrade to Seller Account

```bash
curl -X POST http://localhost:3000/api/account/set-type \
  -H "Content-Type: application/json" \
  -d '{"accountType": "BOTH"}'
```

### Create Seller Profile

```bash
curl -X POST http://localhost:3000/api/seller/profile \
  -H "Content-Type: application/json" \
  -d '{"displayName": "My Art Shop", "bio": "Handmade ceramics from Istanbul"}'
```

### Create a Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Handmade Ceramic Vase",
    "description": "Beautiful blue glazed vase",
    "priceAmount": 25000,
    "currency": "TRY",
    "stockQuantity": 5,
    "categoryId": "your-category-uuid"
  }'
```

### Publish a Product

```bash
curl -X POST http://localhost:3000/api/products/{product-id}/publish
```

### Browse Public Products

```bash
# List all published products
curl http://localhost:3000/api/products/public

# Filter by category
curl http://localhost:3000/api/products/public?category=seramik
```

### Create an Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "product-uuid", "quantity": 2}
    ]
  }'
```

## Error Response Format

All API errors follow this consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": ["Optional array of detailed errors"]
  }
}
```

Common error codes:
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Action not permitted
- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Resource not found
- `SELLER_REQUIRED` - Seller account type required
- `BUYER_REQUIRED` - Buyer account type required
- `SELLER_PROFILE_REQUIRED` - Must create seller profile first

## RLS Verification Checklist

After applying RLS policies, verify with these checks:

1. **Unauthenticated users** should only see:
   - PUBLISHED products
   - VERIFIED seller profiles
   - Categories

2. **BUYER users** should:
   - See their own orders and order items
   - NOT see other users' orders

3. **SELLER users** should:
   - See all their own products (any status)
   - See order items for their products
   - NOT see full order details of customers

4. **Service role** (admin operations):
   - Bypasses all RLS
   - Used for user creation, order processing

## Development

### Database Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database browser)
npx prisma studio
```

### Type Safety

The project uses strict TypeScript. All API request bodies are validated with Zod schemas defined in `src/lib/api/validation.ts`.

## Production Considerations

Before deploying to production:

1. **Security**
   - Ensure `.env.local` is never committed
   - Verify RLS policies are correctly applied
   - Review service role key usage

2. **Performance**
   - Add database indexes as needed
   - Consider connection pooling settings
   - Implement caching where appropriate

3. **Monitoring**
   - Set up error tracking
   - Configure logging
   - Add health check endpoints

## License

Private - All rights reserved.
