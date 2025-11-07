# Changelog

## [P0] - 2024-11-XX

### P0-0: Secret Cleanup & Config
- ✅ Removed leaked Cloudflare API token from README.md
- ✅ Removed leaked Cloudflare account hash from README.md
- ✅ Created `.env.example` with all required environment variables
- ✅ Verified `next.config.ts` has Cloudflare Images domain configured

### P0-1: Auth & Role Guard
- ✅ Verified `lib/auth.ts` has correct Prisma import and Credentials provider
- ✅ Verified `types/next-auth.d.ts` has role augmentation
- ✅ Verified `lib/middleware.ts` has `/admin` and `/seller` route guards
- ✅ Register action uses bcrypt for password hashing
- ✅ Session callback includes role in JWT and session

### P0-2: Data Model Additions
- ✅ Added `Address` model (userId, title, city, district, addressLine, phone, isDefault)
- ✅ Added `Shipment` model (orderId, carrier, trackingCode, status: CREATED/IN_TRANSIT/DELIVERED/RETURNED)
- ✅ Added `Payment` model (orderId, gateway: IYZICO/PAYTR, txnId, status, amountCents, rawPayload JSON)
- ✅ Added `SellerPayoutLedger` model (sellerId, orderId?, type: debit/credit, amountCents, note)
- ✅ Updated `Order` model with addressId, shipments, and payments relations
- ✅ Updated `User` model with addresses relation
- ✅ Updated `Seller` model with payoutLedger relation
- ✅ Updated seed file: 1 admin, 1 seller, 1 customer, 2 categories, 3 products, 5 variants

### P0-3: Cloudflare Images Integration
- ✅ Created `app/admin/products/_components/ImageUploader.tsx` with:
  - Drag & drop support
  - Multiple image upload
  - Progress indication
  - Image reordering (sort order)
  - Image deletion
  - Cloudflare Images integration via `/api/upload`
- ✅ Updated product actions to handle images from ImageUploader

### P0-4: Product/Variant CRUD
- ✅ Added Zod validation to product and variant server actions
- ✅ Created `ProductForm` component with ImageUploader integration
- ✅ Updated product create/edit pages to use ProductForm component
- ✅ Validation errors are displayed to users

### P0-5: Cart & Order State Machine
- ✅ Created `lib/orderService.ts` with:
  - `addToCart(userId, variantId, qty)` - Adds item to cart, creates CART order if needed
  - `placeOrder(userId, addressId)` - CART → PENDING, validates stock, reduces stock
  - `markPaid(orderId, paymentData)` - PENDING → PAID, idempotent payment processing
  - `ship(orderId, tracking)` - PAID → SHIPPED, creates Shipment record
  - `complete(orderId)` - SHIPPED → COMPLETED
  - `getCart(userId)` - Gets user's current cart
  - `removeFromCart(userId, itemId)` - Removes item from cart
  - `updateCartItem(userId, itemId, qty)` - Updates item quantity
- ✅ Updated `/api/cart` route to use orderService
- ✅ Created `/app/checkout/page.tsx` with address selection
- ✅ Created `/api/orders/place` route for placing orders
- ✅ Created `/api/addresses` route for fetching user addresses
- ✅ Cart page redirects to checkout

## Next Steps

1. Run Prisma migration: `npx prisma migrate dev --name add_address_shipment_payment_ledger`
2. Run seed: `npm run prisma:seed`
3. Integrate ImageUploader into admin product forms
4. Create cart and checkout UI pages using orderService
5. Continue with P1 features (payments, search, seller panel)

