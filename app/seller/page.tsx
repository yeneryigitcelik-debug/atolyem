import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SellerPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { seller: true },
  });

  if (!user?.seller) {
    return (
      <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Satıcı Hesabı Bulunamadı</h1>
          <p className="text-gray-600">Satıcı hesabınız oluşturulmamış. Lütfen admin ile iletişime geçin.</p>
        </div>
      </div>
    );
  }

  const productCount = await db.product.count({
    where: { sellerId: user.seller.id },
  });

  const orderCount = await db.order.count({
    where: {
      items: {
        some: {
          variant: {
            product: {
              sellerId: user.seller.id,
            },
          },
        },
      },
      status: { not: "CART" },
    },
  });

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Satıcı Paneli</h1>
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Toplam Ürün</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{productCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Toplam Sipariş</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{orderCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Komisyon Oranı</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">%{(user.seller.commissionBps / 100).toFixed(2)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/seller/products"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Ürünlerim</h2>
            <p className="text-gray-600">Ürünlerinizi yönetin</p>
          </Link>
          <Link
            href="/seller/orders"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Siparişlerim</h2>
            <p className="text-gray-600">Siparişlerinizi görüntüleyin</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

