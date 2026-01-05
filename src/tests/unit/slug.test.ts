/**
 * Unit tests for slug generation
 */

import { describe, it, expect } from "vitest";
import {
  slugify,
  transliterateTurkish,
  generateUniqueSlug,
  isValidSlug,
} from "@/domain/value-objects/slug";

describe("transliterateTurkish", () => {
  it("should convert Turkish lowercase characters", () => {
    expect(transliterateTurkish("çğıöşü")).toBe("cgiosu");
  });

  it("should convert Turkish uppercase characters", () => {
    expect(transliterateTurkish("ÇĞİÖŞÜ")).toBe("cgiosu");
  });

  it("should handle mixed text", () => {
    // Note: Transliteration only handles Turkish chars, doesn't preserve case
    expect(transliterateTurkish("Türkçe Örnek")).toBe("Turkce ornek");
  });

  it("should preserve non-Turkish characters", () => {
    expect(transliterateTurkish("hello world")).toBe("hello world");
  });
});

describe("slugify", () => {
  it("should convert basic text to slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should handle Turkish characters", () => {
    expect(slugify("Türk Çini Sanatı")).toBe("turk-cini-sanati");
    expect(slugify("Örgü İşleri")).toBe("orgu-isleri");
    expect(slugify("Güzel Şeyler")).toBe("guzel-seyler");
  });

  it("should remove special characters", () => {
    expect(slugify("Hello! World?")).toBe("hello-world");
    expect(slugify("Price: $100")).toBe("price-100");
  });

  it("should handle multiple spaces", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("should trim hyphens from ends", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
    expect(slugify("---hello---")).toBe("hello");
  });

  it("should handle consecutive special characters", () => {
    expect(slugify("hello---world")).toBe("hello-world");
    expect(slugify("hello...world")).toBe("hello-world");
  });

  it("should handle numbers", () => {
    expect(slugify("Product 2024")).toBe("product-2024");
  });

  it("should handle mixed case", () => {
    expect(slugify("HeLLo WoRLD")).toBe("hello-world");
  });

  it("should handle real product names", () => {
    expect(slugify("El Yapımı Seramik Vazo - Mavi")).toBe("el-yapimi-seramik-vazo-mavi");
    expect(slugify("Ahşap Oyma Çerçeve 30x40cm")).toBe("ahsap-oyma-cerceve-30x40cm");
  });
});

describe("generateUniqueSlug", () => {
  it("should return base slug if not in existing list", () => {
    expect(generateUniqueSlug("hello", [])).toBe("hello");
    expect(generateUniqueSlug("hello", ["world", "foo"])).toBe("hello");
  });

  it("should add -2 suffix for first conflict", () => {
    expect(generateUniqueSlug("hello", ["hello"])).toBe("hello-2");
  });

  it("should increment suffix for multiple conflicts", () => {
    expect(generateUniqueSlug("hello", ["hello", "hello-2"])).toBe("hello-3");
    expect(generateUniqueSlug("hello", ["hello", "hello-2", "hello-3"])).toBe("hello-4");
  });

  it("should handle gaps in suffix sequence", () => {
    expect(generateUniqueSlug("hello", ["hello", "hello-3"])).toBe("hello-2");
  });
});

describe("isValidSlug", () => {
  it("should accept valid slugs", () => {
    expect(isValidSlug("hello")).toBe(true);
    expect(isValidSlug("hello-world")).toBe(true);
    expect(isValidSlug("hello-world-123")).toBe(true);
    expect(isValidSlug("a")).toBe(true);
    expect(isValidSlug("a1b2c3")).toBe(true);
  });

  it("should reject invalid slugs", () => {
    expect(isValidSlug("")).toBe(false);
    expect(isValidSlug("-hello")).toBe(false);
    expect(isValidSlug("hello-")).toBe(false);
    expect(isValidSlug("hello--world")).toBe(false);
    expect(isValidSlug("Hello")).toBe(false); // uppercase
    expect(isValidSlug("hello world")).toBe(false); // space
    expect(isValidSlug("hello_world")).toBe(false); // underscore
  });
});

