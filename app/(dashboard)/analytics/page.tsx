import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getSellerSummary, getMonthlySales, getTopProducts, getCategoryPerformance } from "@/lib/analytics";
import AnalyticsDashboard from "./_components/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { seller: true },
  });

  if (!user?.seller) {
    redirect("/seller");
  }

  const sellerId = user.seller.id;
  const isPremium = (user as any).isPremium || false;

  // Fetch analytics data
  const [summary, monthlySales, topProducts, categoryPerformance] = await Promise.all([
    getSellerSummary(sellerId),
    getMonthlySales(sellerId, 12),
    getTopProducts(sellerId, 10),
    getCategoryPerformance(sellerId),
  ]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF8F1" }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#1F2937] mb-2">Satış Analitikleri</h1>
                  <p className="text-gray-600">Satış performansınızı detaylı olarak görüntüleyin</p>
                </div>

                {!isPremium && (
                  <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-yellow-600">info</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900">
                          Premium üyeliğe geçerek gelişmiş analitik özelliklerine erişin
                        </p>
                        <a
                          href="/premium"
                          className="text-sm text-yellow-800 underline hover:text-yellow-900"
                        >
                          Premium'a geç →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <AnalyticsDashboard
                  summary={summary}
                  monthlySales={monthlySales}
                  topProducts={topProducts}
                  categoryPerformance={categoryPerformance}
                  isPremium={isPremium}
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

