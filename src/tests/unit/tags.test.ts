/**
 * Unit tests for tag validation
 */

import { describe, it, expect } from "vitest";
import {
  normalizeTag,
  validateTag,
  validateAndNormalizeTags,
  assertTagLimit,
  assertValidTags,
  MAX_TAGS_PER_LISTING,
} from "@/application/integrity-rules/tag-rules";
import { TagLimitError } from "@/lib/api/errors";

describe("normalizeTag", () => {
  it("should convert to lowercase", () => {
    expect(normalizeTag("Hello")).toBe("hello");
    expect(normalizeTag("WORLD")).toBe("world");
  });

  it("should trim whitespace", () => {
    expect(normalizeTag("  hello  ")).toBe("hello");
  });
});

describe("validateTag", () => {
  it("should accept valid tags", () => {
    expect(validateTag("seramik").valid).toBe(true);
    expect(validateTag("el yapımı").valid).toBe(true);
    expect(validateTag("ahşap-işleri").valid).toBe(true);
    expect(validateTag("art2024").valid).toBe(true);
  });

  it("should reject too short tags", () => {
    const result = validateTag("a");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("at least");
  });

  it("should reject too long tags", () => {
    const longTag = "a".repeat(51);
    const result = validateTag(longTag);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("at most");
  });

  it("should reject tags with invalid characters", () => {
    expect(validateTag("hello@world").valid).toBe(false);
    expect(validateTag("hello#world").valid).toBe(false);
    expect(validateTag("hello!").valid).toBe(false);
  });

  it("should accept Turkish characters", () => {
    expect(validateTag("çini").valid).toBe(true);
    expect(validateTag("örgü").valid).toBe(true);
    expect(validateTag("türk işi").valid).toBe(true);
  });
});

describe("validateAndNormalizeTags", () => {
  it("should normalize and deduplicate tags", () => {
    const result = validateAndNormalizeTags(["Hello", "HELLO", "World"]);
    expect(result.tags).toEqual(["hello", "world"]);
    expect(result.errors).toHaveLength(0);
  });

  it("should collect errors for invalid tags", () => {
    const result = validateAndNormalizeTags(["a", "valid-tag", "@invalid"]);
    expect(result.tags).toEqual(["valid-tag"]);
    expect(result.errors).toHaveLength(2);
  });
});

describe("assertTagLimit", () => {
  it("should not throw when within limit", () => {
    expect(() => assertTagLimit(10, 3)).not.toThrow();
    expect(() => assertTagLimit(0, 13)).not.toThrow();
    expect(() => assertTagLimit(12, 1)).not.toThrow();
  });

  it("should throw when exceeding limit", () => {
    expect(() => assertTagLimit(10, 4)).toThrow(TagLimitError);
    expect(() => assertTagLimit(13, 1)).toThrow(TagLimitError);
  });

  it("should use correct max limit of 13", () => {
    expect(MAX_TAGS_PER_LISTING).toBe(13);
    expect(() => assertTagLimit(0, 14)).toThrow(TagLimitError);
  });
});

describe("assertValidTags", () => {
  it("should return normalized tags when valid", () => {
    const tags = assertValidTags(["Seramik", "  ahşap  ", "ÖRGÜ"]);
    expect(tags).toEqual(["seramik", "ahşap", "örgü"]);
  });

  it("should throw on limit exceeded", () => {
    const tags = Array.from({ length: 14 }, (_, i) => `tag${i}`);
    expect(() => assertValidTags(tags)).toThrow(TagLimitError);
  });

  it("should consider existing tags in limit check", () => {
    const newTags = ["tag1", "tag2", "tag3"];
    expect(() => assertValidTags(newTags, 11)).toThrow(TagLimitError);
    expect(() => assertValidTags(newTags, 10)).not.toThrow();
  });
});

