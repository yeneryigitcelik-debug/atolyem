import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true, email: true },
  });

  if (!user || user.role !== "ADMIN") redirect("/");

  const stats = {
    categories: await db.category.count(),
    products: await db.product.count(),
    orders: await db.order.count({ where: { status: { not: "CART" } } }),
    users: await db.user.count(),
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
              <p className="text-sm text-gray-600">Hoş geldiniz, {user.name || user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/api/auth/signout"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Çıkış Yap
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* İstatistikler */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kategoriler</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.categories}</p>
              </div>
              <div className="rounded-full bg-[#D97706]/10 p-3">
                <svg className="h-6 w-6 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ürünler</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.products}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Siparişler</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.orders}</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kullanıcılar</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.users}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı Erişim */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Hızlı Erişim</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/categories"
              className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#D97706] hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-[#D97706]/10 p-2">
                  <svg className="h-6 w-6 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Kategoriler</h3>
              </div>
              <p className="text-sm text-gray-600">Kategori ekle, düzenle ve sil</p>
            </Link>
            <Link
              href="/admin/products"
              className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#D97706] hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Ürünler</h3>
              </div>
              <p className="text-sm text-gray-600">Tüm ürünleri yönet</p>
            </Link>
            <Link
              href="/admin/orders"
              className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#D97706] hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-yellow-100 p-2">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Siparişler</h3>
              </div>
              <p className="text-sm text-gray-600">Siparişleri görüntüle ve yönet</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

