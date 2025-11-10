import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import Link from "next/link";
import LogoutButton from "./_components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin-login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-bold text-gray-900">
              Admin Paneli
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/admin"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/products"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Ürünler
              </Link>
              <Link
                href="/admin/categories"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Kategoriler
              </Link>
              <Link
                href="/admin/sellers"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Satıcılar
              </Link>
              <Link
                href="/admin/users"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Kullanıcılar
              </Link>
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Siparişler
              </Link>
              <Link
                href="/admin/subscriptions"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Abonelikler
              </Link>
              <Link
                href="/admin/feedback"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Geri Bildirimler
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.name || session.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
