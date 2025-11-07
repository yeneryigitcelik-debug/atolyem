"use server";

import { createCategoryAction, updateCategoryAction } from "./actions";

/**
 * Wrapper actions for category forms
 */
export async function createCategoryFormAction(prevState: any, formData: FormData) {
  return createCategoryAction(prevState, formData);
}

export async function updateCategoryFormAction(
  id: string,
  prevState: any,
  formData: FormData
) {
  return updateCategoryAction(id, prevState, formData);
}

