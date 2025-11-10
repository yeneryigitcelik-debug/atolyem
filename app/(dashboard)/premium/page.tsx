import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import PremiumPlans from "./_components/PremiumPlans";

export default async function PremiumPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  const params = await searchParams;
  const showSuccess = params.success === "true";
  const showError = params.error === "true";

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  // Get active subscriptions manually since model might not be migrated yet
  const activeSubscriptions = await (db as any).subscription?.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
    take: 1,
  }).catch(() => []);

  const activeSubscription = activeSubscriptions?.[0] || null;
  const isPremium = (user as any)?.isPremium || false;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF8F1" }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-[#1F2937] mb-4">Premium Abonelik</h1>
                  <p className="text-xl text-gray-600">
                    Satışlarınızı artırın, daha fazla özellik kazanın
                  </p>
                </div>

                {showSuccess && (
                  <div className="mb-8 rounded-lg bg-green-50 border border-green-200 p-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                      <div>
                        <h3 className="font-semibold text-green-900">Ödeme Başarılı!</h3>
                        <p className="text-sm text-green-700">
                          Premium aboneliğiniz aktif edildi. Artık tüm premium özelliklere erişebilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {showError && (
                  <div className="mb-8 rounded-lg bg-red-50 border border-red-200 p-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-600 text-3xl">error</span>
                      <div>
                        <h3 className="font-semibold text-red-900">Ödeme Başarısız</h3>
                        <p className="text-sm text-red-700">
                          Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin veya destek ekibimizle iletişime geçin.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isPremium && activeSubscription && !showSuccess && (
                  <div className="mb-8 rounded-lg bg-green-50 border border-green-200 p-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                      <div>
                        <h3 className="font-semibold text-green-900">Premium Üyeliğiniz Aktif</h3>
                        <p className="text-sm text-green-700">
                          Plan: {activeSubscription.plan} • 
                          Başlangıç: {new Date(activeSubscription.startedAt).toLocaleDateString("tr-TR")}
                          {activeSubscription.expiresAt && (
                            <> • Bitiş: {new Date(activeSubscription.expiresAt).toLocaleDateString("tr-TR")}</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <PremiumPlans currentPlan={activeSubscription?.plan || "BASIC"} isPremium={isPremium} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

