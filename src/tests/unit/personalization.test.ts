/**
 * Unit tests for personalization validation
 */

import { describe, it, expect } from "vitest";
import {
  validatePersonalization,
  assertValidPersonalization,
  requiresPersonalization,
  sanitizePersonalizationInput,
  type PersonalizationFieldDef,
} from "@/application/integrity-rules/personalization-rules";
import { AppError } from "@/lib/api/errors";

const mockFields: PersonalizationFieldDef[] = [
  {
    id: "field-1",
    label: "İsim",
    isRequired: true,
    minLength: 2,
    maxLength: 50,
  },
  {
    id: "field-2",
    label: "Mesaj",
    isRequired: false,
    minLength: null,
    maxLength: 200,
  },
];

describe("validatePersonalization", () => {
  it("should return no errors for valid input", () => {
    const errors = validatePersonalization(mockFields, {
      "field-1": "John",
      "field-2": "Happy Birthday!",
    });
    expect(errors).toHaveLength(0);
  });

  it("should return error for missing required field", () => {
    const errors = validatePersonalization(mockFields, {
      "field-2": "Message",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].fieldId).toBe("field-1");
    expect(errors[0].error).toContain("required");
  });

  it("should return error for too short value", () => {
    const errors = validatePersonalization(mockFields, {
      "field-1": "A",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].error).toContain("at least 2");
  });

  it("should return error for too long value", () => {
    const errors = validatePersonalization(mockFields, {
      "field-1": "Valid",
      "field-2": "A".repeat(201),
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].fieldId).toBe("field-2");
    expect(errors[0].error).toContain("at most 200");
  });

  it("should handle null/undefined input", () => {
    const errors = validatePersonalization(mockFields, null);
    expect(errors).toHaveLength(1); // Only required field error
    expect(errors[0].fieldId).toBe("field-1");
  });

  it("should skip validation for empty optional fields", () => {
    const errors = validatePersonalization(mockFields, {
      "field-1": "Valid Name",
      "field-2": "",
    });
    expect(errors).toHaveLength(0);
  });
});

describe("assertValidPersonalization", () => {
  it("should not throw for valid input", () => {
    expect(() =>
      assertValidPersonalization(mockFields, { "field-1": "Valid Name" })
    ).not.toThrow();
  });

  it("should throw AppError for invalid input", () => {
    expect(() =>
      assertValidPersonalization(mockFields, { "field-1": "A" })
    ).toThrow(AppError);
  });
});

describe("requiresPersonalization", () => {
  it("should return true when any field is required", () => {
    expect(requiresPersonalization(mockFields)).toBe(true);
  });

  it("should return false when no fields are required", () => {
    const optionalFields: PersonalizationFieldDef[] = [
      { id: "opt-1", label: "Optional", isRequired: false, minLength: null, maxLength: null },
    ];
    expect(requiresPersonalization(optionalFields)).toBe(false);
  });

  it("should return false for empty fields", () => {
    expect(requiresPersonalization([])).toBe(false);
  });
});

describe("sanitizePersonalizationInput", () => {
  it("should trim whitespace", () => {
    const result = sanitizePersonalizationInput(mockFields, {
      "field-1": "  John  ",
    });
    expect(result["field-1"]).toBe("John");
  });

  it("should remove unknown fields", () => {
    const result = sanitizePersonalizationInput(mockFields, {
      "field-1": "John",
      "unknown-field": "Value",
    });
    expect(result).not.toHaveProperty("unknown-field");
    expect(result).toHaveProperty("field-1");
  });

  it("should remove empty values", () => {
    const result = sanitizePersonalizationInput(mockFields, {
      "field-1": "John",
      "field-2": "   ",
    });
    expect(result).not.toHaveProperty("field-2");
  });

  it("should return empty object for null input", () => {
    const result = sanitizePersonalizationInput(mockFields, null);
    expect(result).toEqual({});
  });
});

