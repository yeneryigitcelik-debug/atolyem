import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  const params = await searchParams;
  const orderId = params.orderId;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <Header />

            <main className="flex-1 my-8">
              <div className="max-w-2xl mx-auto px-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-16 w-16 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-green-800 mb-2">
                    Ödeme Başarılı!
                  </h1>
                  <p className="text-gray-700 mb-6">
                    Siparişiniz başarıyla alındı. En kısa sürede hazırlanacak.
                  </p>
                  {orderId && (
                    <p className="text-sm text-gray-600 mb-6">
                      Sipariş No: {orderId.slice(-8)}
                    </p>
                  )}
                  <div className="flex gap-4 justify-center">
                    <Link
                      href="/orders"
                      className="rounded-md bg-[#D97706] px-6 py-3 text-white hover:bg-[#92400E] transition-colors font-medium"
                    >
                      Siparişlerimi Gör
                    </Link>
                    <Link
                      href="/catalog"
                      className="rounded-md border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Alışverişe Devam Et
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

