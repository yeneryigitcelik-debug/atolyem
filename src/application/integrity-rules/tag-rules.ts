/**
 * Tag Rules
 * 
 * Rule G: Tag management
 * - Maximum 13 tags per listing (Etsy-like)
 * - Tags should be normalized (lowercase, trimmed)
 * - No duplicate tags on same listing
 */

import { TagLimitError, AppError, ErrorCodes } from "@/lib/api/errors";

export const MAX_TAGS_PER_LISTING = 13;
export const MIN_TAG_LENGTH = 2;
export const MAX_TAG_LENGTH = 50;

/**
 * Normalize a single tag
 */
export function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim();
}

/**
 * Validate a single tag
 */
export function validateTag(tag: string): { valid: boolean; error?: string } {
  const normalized = normalizeTag(tag);

  if (normalized.length < MIN_TAG_LENGTH) {
    return {
      valid: false,
      error: `Tag must be at least ${MIN_TAG_LENGTH} characters`,
    };
  }

  if (normalized.length > MAX_TAG_LENGTH) {
    return {
      valid: false,
      error: `Tag must be at most ${MAX_TAG_LENGTH} characters`,
    };
  }

  // Only allow alphanumeric, Turkish characters, spaces, and hyphens
  if (!/^[a-zA-ZğüşöçıİĞÜŞÖÇ0-9\s-]+$/.test(normalized)) {
    return {
      valid: false,
      error: "Tag contains invalid characters",
    };
  }

  return { valid: true };
}

/**
 * Validate and normalize a list of tags
 */
export function validateAndNormalizeTags(
  tags: string[]
): { tags: string[]; errors: Array<{ tag: string; error: string }> } {
  const errors: Array<{ tag: string; error: string }> = [];
  const normalizedTags: string[] = [];
  const seen = new Set<string>();

  for (const tag of tags) {
    const validation = validateTag(tag);
    const normalized = normalizeTag(tag);

    if (!validation.valid) {
      errors.push({ tag, error: validation.error! });
      continue;
    }

    // Skip duplicates
    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    normalizedTags.push(normalized);
  }

  return { tags: normalizedTags, errors };
}

/**
 * Assert tag count is within limit
 * @throws TagLimitError if limit exceeded
 */
export function assertTagLimit(
  currentTagCount: number,
  newTagCount: number
): void {
  const totalAfterAdd = currentTagCount + newTagCount;

  if (totalAfterAdd > MAX_TAGS_PER_LISTING) {
    throw new TagLimitError(MAX_TAGS_PER_LISTING);
  }
}

/**
 * Assert tags are valid for adding to a listing
 * Combines all tag validation
 */
export function assertValidTags(
  tags: string[],
  existingTagCount = 0
): string[] {
  // Check limit first
  assertTagLimit(existingTagCount, tags.length);

  // Validate and normalize
  const { tags: normalizedTags, errors } = validateAndNormalizeTags(tags);

  if (errors.length > 0) {
    throw new AppError(
      ErrorCodes.VALIDATION_ERROR,
      "Some tags are invalid",
      400,
      errors
    );
  }

  // Re-check limit after deduplication
  if (existingTagCount + normalizedTags.length > MAX_TAGS_PER_LISTING) {
    throw new TagLimitError(MAX_TAGS_PER_LISTING);
  }

  return normalizedTags;
}

