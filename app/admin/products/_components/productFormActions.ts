"use server";

import { createProductAction, updateProductAction } from "../actions";

/**
 * Unified action for ProductForm client component
 * Handles both create and edit modes based on formData
 */
export async function productFormAction(prevState: any, formData: FormData) {
  const productId = formData.get("_productId") as string | null;
  
  if (productId) {
    // Edit mode
    return updateProductAction(productId, prevState, formData);
  } else {
    // Create mode
    return createProductAction(prevState, formData);
  }
}

