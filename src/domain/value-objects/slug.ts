/**
 * Slug Value Object
 * Handles Turkish character transliteration and slug generation
 */

// Turkish character mapping
const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i", // Turkish I without dot -> i
  İ: "i", // Turkish İ with dot -> i
  i: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

/**
 * Transliterate Turkish characters to ASCII equivalents
 */
export function transliterateTurkish(text: string): string {
  return text
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] || char)
    .join("");
}

/**
 * Generate a URL-safe slug from text
 * - Transliterates Turkish characters
 * - Converts to lowercase
 * - Replaces spaces and special chars with hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start/end
 */
export function slugify(text: string): string {
  return (
    transliterateTurkish(text)
      .toLowerCase()
      // Replace non-alphanumeric with hyphens
      .replace(/[^a-z0-9]+/g, "-")
      // Remove consecutive hyphens
      .replace(/-+/g, "-")
      // Trim hyphens from ends
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * Generate a unique slug with suffix if needed
 * Used when checking against existing slugs in DB
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let candidateSlug = `${baseSlug}-${suffix}`;

  while (existingSlugs.includes(candidateSlug)) {
    suffix++;
    candidateSlug = `${baseSlug}-${suffix}`;
  }

  return candidateSlug;
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  // Must be lowercase alphanumeric with hyphens
  // Must not start or end with hyphen
  // Must be at least 1 character
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 1;
}

