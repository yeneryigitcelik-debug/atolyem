-- ============================================================================
-- atolyem.net Row Level Security (RLS) Policies
-- ============================================================================
-- 
-- IMPORTANT: Run this SQL in the Supabase SQL Editor after applying Prisma migrations.
-- These policies enforce data access rules at the database level.
--
-- Prerequisites:
-- 1. Prisma migrations have been applied
-- 2. Tables exist: app_user, user_preferences, seller_profile, product, order, order_item
--
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE review ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get the current authenticated user's ID from Supabase auth
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user has a seller profile
CREATE OR REPLACE FUNCTION auth.has_seller_profile()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM seller_profile 
    WHERE user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Get user's seller profile ID
CREATE OR REPLACE FUNCTION auth.seller_profile_id()
RETURNS UUID AS $$
  SELECT id FROM seller_profile 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user has SELLER or BOTH account type
CREATE OR REPLACE FUNCTION auth.is_seller()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_user 
    WHERE id = auth.uid() 
    AND account_type IN ('SELLER', 'BOTH')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user has BUYER or BOTH account type  
CREATE OR REPLACE FUNCTION auth.is_buyer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_user 
    WHERE id = auth.uid() 
    AND account_type IN ('BUYER', 'BOTH')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- APP_USER POLICIES
-- ============================================================================

-- Users can read their own data
CREATE POLICY "Users can read own app_user"
ON app_user FOR SELECT
USING (id = auth.uid());

-- Users can update their own data
CREATE POLICY "Users can update own app_user"
ON app_user FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Service role can insert (for upsert on first login)
-- Note: RLS is bypassed with service role key

-- ============================================================================
-- USER_PREFERENCES POLICIES
-- ============================================================================

-- Users can read their own preferences
CREATE POLICY "Users can read own preferences"
ON user_preferences FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON user_preferences FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON user_preferences FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SELLER_PROFILE POLICIES
-- ============================================================================

-- Users can read their own seller profile
CREATE POLICY "Users can read own seller_profile"
ON seller_profile FOR SELECT
USING (user_id = auth.uid());

-- Public can read VERIFIED seller profiles
CREATE POLICY "Public can read verified seller_profiles"
ON seller_profile FOR SELECT
USING (verification_status = 'VERIFIED');

-- Users with SELLER/BOTH can insert their seller profile
CREATE POLICY "Sellers can insert own seller_profile"
ON seller_profile FOR INSERT
WITH CHECK (user_id = auth.uid() AND auth.is_seller());

-- Users can update their own seller profile
CREATE POLICY "Users can update own seller_profile"
ON seller_profile FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- CATEGORY POLICIES
-- ============================================================================

-- Anyone can read categories
CREATE POLICY "Public can read categories"
ON category FOR SELECT
USING (true);

-- ============================================================================
-- PRODUCT POLICIES
-- ============================================================================

-- Public can read PUBLISHED products
CREATE POLICY "Public can read published products"
ON product FOR SELECT
USING (status = 'PUBLISHED');

-- Sellers can read their own products (any status)
CREATE POLICY "Sellers can read own products"
ON product FOR SELECT
USING (seller_id = auth.seller_profile_id());

-- Sellers can insert products
CREATE POLICY "Sellers can insert products"
ON product FOR INSERT
WITH CHECK (seller_id = auth.seller_profile_id());

-- Sellers can update their own products
CREATE POLICY "Sellers can update own products"
ON product FOR UPDATE
USING (seller_id = auth.seller_profile_id())
WITH CHECK (seller_id = auth.seller_profile_id());

-- Sellers can delete their own products
CREATE POLICY "Sellers can delete own products"
ON product FOR DELETE
USING (seller_id = auth.seller_profile_id());

-- ============================================================================
-- PRODUCT_IMAGE POLICIES
-- ============================================================================

-- Public can read images of published products
CREATE POLICY "Public can read product_images of published products"
ON product_image FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM product 
    WHERE product.id = product_image.product_id 
    AND product.status = 'PUBLISHED'
  )
);

-- Sellers can read images of their own products
CREATE POLICY "Sellers can read own product_images"
ON product_image FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM product 
    WHERE product.id = product_image.product_id 
    AND product.seller_id = auth.seller_profile_id()
  )
);

-- Sellers can insert images for their own products
CREATE POLICY "Sellers can insert own product_images"
ON product_image FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM product 
    WHERE product.id = product_image.product_id 
    AND product.seller_id = auth.seller_profile_id()
  )
);

-- Sellers can delete images of their own products
CREATE POLICY "Sellers can delete own product_images"
ON product_image FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM product 
    WHERE product.id = product_image.product_id 
    AND product.seller_id = auth.seller_profile_id()
  )
);

-- ============================================================================
-- ORDER POLICIES
-- ============================================================================

-- Buyers can read their own orders
CREATE POLICY "Buyers can read own orders"
ON "order" FOR SELECT
USING (buyer_user_id = auth.uid());

-- Buyers can insert orders for themselves
CREATE POLICY "Buyers can insert own orders"
ON "order" FOR INSERT
WITH CHECK (buyer_user_id = auth.uid() AND auth.is_buyer());

-- ============================================================================
-- ORDER_ITEM POLICIES
-- ============================================================================

-- Buyers can read order items of their own orders
CREATE POLICY "Buyers can read own order_items"
ON order_item FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "order" 
    WHERE "order".id = order_item.order_id 
    AND "order".buyer_user_id = auth.uid()
  )
);

-- Sellers can read order items for their products
CREATE POLICY "Sellers can read their order_items"
ON order_item FOR SELECT
USING (seller_id = auth.seller_profile_id());

-- Order items are inserted via service role (bypasses RLS)
-- This is handled in the order creation transaction

-- ============================================================================
-- REVIEW POLICIES
-- ============================================================================

-- Anyone can read reviews (public data)
CREATE POLICY "Public can read reviews"
ON review FOR SELECT
USING (true);

-- Buyers can insert reviews for products they've purchased
CREATE POLICY "Buyers can insert reviews"
ON review FOR INSERT
WITH CHECK (
  buyer_user_id = auth.uid() 
  AND auth.is_buyer()
  AND EXISTS (
    SELECT 1 FROM order_item oi
    JOIN "order" o ON o.id = oi.order_id
    WHERE oi.product_id = review.product_id
    AND o.buyer_user_id = auth.uid()
    AND o.status IN ('PAID', 'FULFILLED')
  )
);

-- Buyers can update their own reviews
CREATE POLICY "Buyers can update own reviews"
ON review FOR UPDATE
USING (buyer_user_id = auth.uid())
WITH CHECK (buyer_user_id = auth.uid());

-- Buyers can delete their own reviews
CREATE POLICY "Buyers can delete own reviews"
ON review FOR DELETE
USING (buyer_user_id = auth.uid());

-- ============================================================================
-- RLS VERIFICATION CHECKLIST
-- ============================================================================
/*
After applying these policies, verify with the following test queries:

1. As an unauthenticated user:
   - Should see only PUBLISHED products
   - Should see only VERIFIED seller profiles
   - Should NOT see any orders or order items
   
2. As a BUYER user:
   - Should see their own app_user record
   - Should see their own orders
   - Should see order items of their orders
   - Should NOT see other users' orders
   
3. As a SELLER user:
   - Should see their own products (all statuses)
   - Should see order items where they are the seller
   - Should NOT see orders they didn't sell to
   
4. Service role (admin):
   - Bypasses all RLS
   - Used for order creation, user upsert, etc.

Example verification queries:

-- Test as a specific user (replace UUID with actual user ID)
SET request.jwt.claim.sub = 'your-user-uuid';

-- Check if user can see their own profile
SELECT * FROM app_user;

-- Check products visible to user
SELECT * FROM product;

-- Check orders visible to user  
SELECT * FROM "order";
*/

