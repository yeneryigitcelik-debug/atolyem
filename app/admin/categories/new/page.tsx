import { db } from "@/lib/db";
import { createCategoryAction } from "../actions";

export default async function NewCategoryPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Yeni Kategori</h1>
        <form action={createCategoryAction} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
                Oluştur
              </button>
              <a
                href="/admin/categories"
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                İptal
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

