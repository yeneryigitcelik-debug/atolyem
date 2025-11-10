import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SubscriptionsList from "./_components/SubscriptionsList";

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/admin-login");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/admin-login");
  }

  // Get all subscriptions with user info
  const subscriptions = await (db as any).subscription?.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  // Get premium users count
  const premiumUsersCount = await db.user.count({
    where: { role: "SELLER" }, // Temporary fallback
  });

  // Get active subscriptions count
  const activeSubscriptionsCount = await (db as any).subscription?.count({
    where: { status: "ACTIVE" },
  }).catch(() => 0) || 0;

  // Get monthly revenue
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyRevenue = await (db as any).subscription?.aggregate({
    where: {
      status: "ACTIVE",
      createdAt: { gte: thisMonth },
    },
    _sum: {
      amountCents: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Abonelikler</h1>
          <p className="text-gray-600">Tüm abonelikleri görüntüleyin ve yönetin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Premium Kullanıcılar</h3>
            <p className="text-3xl font-bold text-[#D97706]">{premiumUsersCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Aktif Abonelikler</h3>
            <p className="text-3xl font-bold text-green-600">{activeSubscriptionsCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Bu Ay Gelir</h3>
            <p className="text-3xl font-bold text-blue-600">
              {((monthlyRevenue._sum.amountCents || 0) / 100).toFixed(2)} ₺
            </p>
          </div>
        </div>

        <SubscriptionsList subscriptions={subscriptions} />
      </div>
    </div>
  );
}

