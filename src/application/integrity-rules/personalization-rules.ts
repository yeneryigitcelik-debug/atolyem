/**
 * Personalization Validation Rules
 * 
 * Validate buyer-provided personalization data against listing requirements
 */

import { AppError, ErrorCodes } from "@/lib/api/errors";

export interface PersonalizationFieldDef {
  id: string;
  label: string;
  isRequired: boolean;
  minLength: number | null;
  maxLength: number | null;
}

export interface PersonalizationInput {
  [fieldId: string]: string;
}

export interface PersonalizationValidationError {
  fieldId: string;
  fieldLabel: string;
  error: string;
}

/**
 * Validate personalization input against field definitions
 */
export function validatePersonalization(
  fields: PersonalizationFieldDef[],
  input: PersonalizationInput | null | undefined
): PersonalizationValidationError[] {
  const errors: PersonalizationValidationError[] = [];

  for (const field of fields) {
    const value = input?.[field.id];
    const trimmedValue = value?.trim() || "";

    // Check required
    if (field.isRequired && !trimmedValue) {
      errors.push({
        fieldId: field.id,
        fieldLabel: field.label,
        error: `${field.label} is required`,
      });
      continue;
    }

    // Skip further validation if empty and not required
    if (!trimmedValue) {
      continue;
    }

    // Check min length
    if (field.minLength !== null && trimmedValue.length < field.minLength) {
      errors.push({
        fieldId: field.id,
        fieldLabel: field.label,
        error: `${field.label} must be at least ${field.minLength} characters`,
      });
    }

    // Check max length
    if (field.maxLength !== null && trimmedValue.length > field.maxLength) {
      errors.push({
        fieldId: field.id,
        fieldLabel: field.label,
        error: `${field.label} must be at most ${field.maxLength} characters`,
      });
    }
  }

  return errors;
}

/**
 * Assert personalization is valid, throwing if not
 */
export function assertValidPersonalization(
  fields: PersonalizationFieldDef[],
  input: PersonalizationInput | null | undefined
): void {
  const errors = validatePersonalization(fields, input);

  if (errors.length > 0) {
    throw new AppError(
      ErrorCodes.PERSONALIZATION_INVALID,
      "Personalization validation failed",
      400,
      errors
    );
  }
}

/**
 * Check if a listing requires personalization
 */
export function requiresPersonalization(fields: PersonalizationFieldDef[]): boolean {
  return fields.some((f) => f.isRequired);
}

/**
 * Sanitize personalization input
 * - Trim whitespace
 * - Remove fields not in definition
 * - Keep only non-empty values
 */
export function sanitizePersonalizationInput(
  fields: PersonalizationFieldDef[],
  input: PersonalizationInput | null | undefined
): PersonalizationInput {
  if (!input) {
    return {};
  }

  const fieldIds = new Set(fields.map((f) => f.id));
  const sanitized: PersonalizationInput = {};

  for (const [key, value] of Object.entries(input)) {
    if (fieldIds.has(key)) {
      const trimmed = value?.trim();
      if (trimmed) {
        sanitized[key] = trimmed;
      }
    }
  }

  return sanitized;
}

