-- ============================================================================
-- Listing & Listing Media RLS Policies
-- ============================================================================
-- 
-- IMPORTANT: Run this SQL in the Supabase SQL Editor after applying Prisma migrations.
-- These policies enforce data access rules at the database level for listings.
--
-- Prerequisites:
-- 1. Prisma migrations have been applied
-- 2. Tables exist: listing, listing_media
-- 3. Helper functions from rls.sql are available
--
-- ============================================================================

-- Enable RLS on listing tables
ALTER TABLE listing ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- LISTING POLICIES
-- ============================================================================

-- Public can read PUBLISHED listings (not private, not removed)
CREATE POLICY "Public can read published listings"
ON listing FOR SELECT
USING (
  status = 'PUBLISHED' 
  AND compliance_status IN ('PENDING', 'APPROVED')
  AND is_private = false
);

-- Sellers can read their own listings (any status)
CREATE POLICY "Sellers can read own listings"
ON listing FOR SELECT
USING (seller_user_id = auth.uid());

-- Sellers can insert listings
CREATE POLICY "Sellers can insert listings"
ON listing FOR INSERT
WITH CHECK (
  seller_user_id = auth.uid() 
  AND auth.is_seller()
);

-- Sellers can update their own listings
CREATE POLICY "Sellers can update own listings"
ON listing FOR UPDATE
USING (seller_user_id = auth.uid())
WITH CHECK (seller_user_id = auth.uid());

-- Sellers can delete their own listings (soft delete via status change recommended)
-- Note: Hard delete is allowed but not recommended - use ARCHIVED status instead
CREATE POLICY "Sellers can delete own listings"
ON listing FOR DELETE
USING (seller_user_id = auth.uid());

-- ============================================================================
-- LISTING_MEDIA POLICIES
-- ============================================================================

-- Public can read media of published listings
CREATE POLICY "Public can read media of published listings"
ON listing_media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM listing 
    WHERE listing.id = listing_media.listing_id 
    AND listing.status = 'PUBLISHED'
    AND listing.compliance_status IN ('PENDING', 'APPROVED')
    AND listing.is_private = false
  )
);

-- Sellers can read media of their own listings
CREATE POLICY "Sellers can read own listing media"
ON listing_media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM listing 
    WHERE listing.id = listing_media.listing_id 
    AND listing.seller_user_id = auth.uid()
  )
);

-- Sellers can insert media for their own listings
CREATE POLICY "Sellers can insert own listing media"
ON listing_media FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM listing 
    WHERE listing.id = listing_media.listing_id 
    AND listing.seller_user_id = auth.uid()
  )
);

-- Sellers can update media of their own listings
CREATE POLICY "Sellers can update own listing media"
ON listing_media FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM listing 
    WHERE listing.id = listing_media.listing_id 
    AND listing.seller_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM listing 
    WHERE listing.id = listing_media.listing_id 
    AND listing.seller_user_id = auth.uid()
  )
);

-- Sellers can delete media of their own listings
CREATE POLICY "Sellers can delete own listing media"
ON listing_media FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM listing 
    WHERE listing.id = listing_media.listing_id 
    AND listing.seller_user_id = auth.uid()
  )
);

