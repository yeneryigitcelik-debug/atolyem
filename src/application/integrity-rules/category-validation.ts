/**
 * Category Attribute Validation
 * 
 * Validates listing attributes against category requirements
 */

import { prisma } from "@/lib/db/prisma";
import { AppError, ErrorCodes } from "@/lib/api/errors";

export interface ListingAttribute {
  key: string;
  value: string;
}

/**
 * Validate listing attributes against category requirements
 * @throws AppError if validation fails
 */
export async function validateCategoryAttributes(
  categoryId: string | null | undefined,
  attributes: ListingAttribute[] | undefined
): Promise<void> {
  // If no category, skip validation (optional)
  if (!categoryId) {
    return;
  }

  // Get category attributes requirements
  const categoryAttributes = await prisma.categoryAttribute.findMany({
    where: { categoryId },
  });

  if (categoryAttributes.length === 0) {
    // No requirements, skip validation
    return;
  }

  // Build map of provided attributes
  const providedAttributes = new Map<string, string[]>();
  for (const attr of attributes || []) {
    if (!providedAttributes.has(attr.key)) {
      providedAttributes.set(attr.key, []);
    }
    providedAttributes.get(attr.key)!.push(attr.value);
  }

  // Validate required attributes
  for (const categoryAttr of categoryAttributes) {
    if (categoryAttr.isRequired) {
      const provided = providedAttributes.get(categoryAttr.key);
      
      if (!provided || provided.length === 0) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          `Required attribute '${categoryAttr.label}' (${categoryAttr.key}) is missing`,
          400
        );
      }

      // Validate value against allowed options if specified
      if (categoryAttr.options && categoryAttr.inputType !== "text") {
        const allowedValues = categoryAttr.options as string[];
        const invalidValues = provided.filter(v => !allowedValues.includes(v));
        
        if (invalidValues.length > 0) {
          throw new AppError(
            ErrorCodes.VALIDATION_ERROR,
            `Invalid value(s) for '${categoryAttr.label}': ${invalidValues.join(", ")}. Allowed values: ${allowedValues.join(", ")}`,
            400
          );
        }
      }
    }
  }

  // Warn about unknown attributes (optional - can be removed for strict validation)
  for (const attr of attributes || []) {
    const categoryAttr = categoryAttributes.find(ca => ca.key === attr.key);
    if (!categoryAttr) {
      // Unknown attribute - log warning but don't fail
      console.warn(`Unknown attribute '${attr.key}' for category ${categoryId}`);
    }
  }
}

