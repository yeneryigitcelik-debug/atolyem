-- ============================================================================
-- Full Text Search Migration
-- ============================================================================
-- Enables PostgreSQL full text search for listings
-- Improves search performance significantly for large datasets
-- ============================================================================

-- Add tsvector column for full text search
ALTER TABLE listing ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search_vector
CREATE OR REPLACE FUNCTION listing_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('turkish', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('turkish', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search_vector
DROP TRIGGER IF EXISTS listing_search_vector_trigger ON listing;
CREATE TRIGGER listing_search_vector_trigger
  BEFORE INSERT OR UPDATE ON listing
  FOR EACH ROW EXECUTE FUNCTION listing_search_vector_update();

-- Update existing rows
UPDATE listing SET search_vector =
  setweight(to_tsvector('turkish', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('turkish', COALESCE(description, '')), 'B');

-- Create GIN index for fast full text search
CREATE INDEX IF NOT EXISTS listing_search_vector_idx ON listing USING GIN (search_vector);

-- Create function for full text search (optional helper)
CREATE OR REPLACE FUNCTION search_listings(search_query text)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.slug,
    ts_rank(l.search_vector, plainto_tsquery('turkish', search_query)) as rank
  FROM listing l
  WHERE l.search_vector @@ plainto_tsquery('turkish', search_query)
    AND l.status = 'PUBLISHED'
    AND l.compliance_status IN ('PENDING', 'APPROVED')
    AND l.is_private = false
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON COLUMN listing.search_vector IS 'Full text search vector for PostgreSQL tsvector';
COMMENT ON INDEX listing_search_vector_idx IS 'GIN index for fast full text search queries';
COMMENT ON FUNCTION search_listings IS 'Helper function for full text search (optional, can use raw SQL instead)';

