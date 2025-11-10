import { db } from "@/lib/db";
import Link from "next/link";

export default async function CategoriesPage() {
  // Admin yetki kontrolü layout'ta yapılıyor
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { products: true, children: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
            <p className="text-sm text-gray-600">Kategori ekle, düzenle ve sil</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Geri Dön
            </Link>
            <Link
              href="/admin/categories/new"
              className="rounded-md bg-[#D97706] px-4 py-2 text-sm font-medium text-white hover:bg-[#92400E] transition-colors"
            >
              Yeni Kategori
            </Link>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-600">Henüz kategori bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ürün Sayısı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Alt Kategori
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {cat.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{cat.slug}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {cat._count.products}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {cat._count.children}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/admin/categories/${cat.id}/edit`}
                      className="text-[#D97706] hover:text-[#92400E]"
                    >
                      Düzenle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </main>
    </div>
  );
}

