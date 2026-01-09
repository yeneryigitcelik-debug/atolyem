-- ============================================================================
-- Tax Rate Snapshot Migration
-- ============================================================================
-- Adds taxRateSnapshot field to OrderItem for invoice generation
-- Stores tax rate at purchase time for financial compliance
-- ============================================================================

-- Add taxRateSnapshot column to order_item table
ALTER TABLE order_item 
ADD COLUMN IF NOT EXISTS tax_rate_snapshot DECIMAL(5, 4);

-- Add comment
COMMENT ON COLUMN order_item.tax_rate_snapshot IS 
'Tax rate (e.g., 0.2000 for 20% KDV) at purchase time. Required for invoice generation and financial compliance.';

-- Update existing order items with default tax rate (20% KDV for Turkey)
-- Only update if NULL to preserve existing data
UPDATE order_item 
SET tax_rate_snapshot = 0.2000 
WHERE tax_rate_snapshot IS NULL;

