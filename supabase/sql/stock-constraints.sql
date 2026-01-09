-- ============================================================================
-- Stock Constraints Migration
-- ============================================================================
-- Prevents negative stock values at database level
-- This is a critical safety measure to prevent race conditions
-- ============================================================================

-- Add CHECK constraint to prevent negative baseQuantity in Listing table
ALTER TABLE "listing"
ADD CONSTRAINT "listing_base_quantity_non_negative"
CHECK ("base_quantity" >= 0);

-- Add CHECK constraint to prevent negative quantityOverride in ListingVariant table
-- Note: quantityOverride can be NULL, so we only check when it's not NULL
ALTER TABLE "listing_variant"
ADD CONSTRAINT "listing_variant_quantity_override_non_negative"
CHECK ("quantity_override" IS NULL OR "quantity_override" >= 0);

-- Add comments for documentation
COMMENT ON CONSTRAINT "listing_base_quantity_non_negative" ON "listing" IS 
'Ensures base stock quantity never goes negative, preventing overselling due to race conditions';

COMMENT ON CONSTRAINT "listing_variant_quantity_override_non_negative" ON "listing_variant" IS 
'Ensures variant stock quantity override never goes negative when set, preventing overselling due to race conditions';

