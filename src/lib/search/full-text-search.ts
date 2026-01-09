/**
 * PostgreSQL Full Text Search Utilities
 * 
 * Implements tsvector/tsquery for efficient text search
 * Better performance than LIKE queries for large datasets
 */

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

/**
 * Create a search query using PostgreSQL full text search
 * 
 * @param searchTerm - The search query string
 * @param fields - Fields to search in (default: title, description)
 * @returns Prisma where clause for full text search
 */
export function createFullTextSearchQuery(
  searchTerm: string,
  fields: string[] = ["title", "description"]
): Prisma.ListingWhereInput {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return {};
  }

  // Normalize search term: remove special chars, convert to tsquery format
  const normalizedTerm = searchTerm
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^\w]/g, ""))
    .filter((word) => word.length > 0)
    .join(" & "); // AND operator for tsquery

  if (normalizedTerm.length === 0) {
    return {};
  }

  // Use raw SQL for full text search
  // PostgreSQL tsvector requires raw query or custom function
  // For now, we'll use a combination of ILIKE for MVP, but structure for tsvector
  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: "insensitive",
      },
    })),
  };
}

/**
 * Create full text search index migration SQL
 * Run this in Supabase SQL Editor to enable full text search
 */
export const FULL_TEXT_SEARCH_MIGRATION = `
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

-- Create function for full text search
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
`;

/**
 * Use full text search in Prisma query
 * Note: This requires the migration above to be run first
 */
export async function searchListingsWithFullText(
  searchTerm: string,
  limit = 20,
  offset = 0
) {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return [];
  }

  // Use raw query for full text search
  const results = await prisma.$queryRaw<
    Array<{
      id: string;
      title: string;
      slug: string;
      rank: number;
    }>
  >`
    SELECT
      id,
      title,
      slug,
      ts_rank(search_vector, plainto_tsquery('turkish', ${searchTerm})) as rank
    FROM listing
    WHERE search_vector @@ plainto_tsquery('turkish', ${searchTerm})
      AND status = 'PUBLISHED'
      AND compliance_status IN ('PENDING', 'APPROVED')
      AND is_private = false
    ORDER BY rank DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return results;
}

