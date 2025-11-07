"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCategoryFormAction, updateCategoryFormAction } from "../_actions";

/**
 * Category form component
 */
interface CategoryFormProps {
  mode: "create" | "edit";
  categoryId?: string;
  defaultValues?: {
    name?: string;
    slug?: string;
    parentId?: string;
  };
  categories: Array<{ id: string; name: string }>;
  submitLabel?: string;
  cancelHref?: string;
}

export default function CategoryForm({
  mode,
  categoryId,
  defaultValues,
  categories,
  submitLabel = "Kaydet",
  cancelHref,
}: CategoryFormProps) {
  const action = mode === "create"
    ? createCategoryFormAction
    : (prevState: any, formData: FormData) => updateCategoryFormAction(categoryId!, prevState, formData);

  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {state && "error" in state && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{state.error}</div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Kategori Adı
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            defaultValue={defaultValues?.slug}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            placeholder="ornek-kategori"
          />
        </div>
        <div>
          <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
            Üst Kategori (Opsiyonel)
          </label>
          <select
            id="parentId"
            name="parentId"
            defaultValue={defaultValues?.parentId}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
          >
            <option value="">Yok</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-white hover:bg-secondary transition-colors"
          >
            {submitLabel}
          </button>
          {cancelHref && (
            <Link
              href={cancelHref}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              İptal
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}

