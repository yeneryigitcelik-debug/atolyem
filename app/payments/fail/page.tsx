import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";

export default async function PaymentFailPage({
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
                <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-16 w-16 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-red-800 mb-2">
                    Ödeme Başarısız
                  </h1>
                  <p className="text-gray-700 mb-6">
                    Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.
                  </p>
                  {orderId && (
                    <p className="text-sm text-gray-600 mb-6">
                      Sipariş No: {orderId.slice(-8)}
                    </p>
                  )}
                  <div className="flex gap-4 justify-center">
                    <Link
                      href="/checkout"
                      className="rounded-md bg-[#D97706] px-6 py-3 text-white hover:bg-[#92400E] transition-colors font-medium"
                    >
                      Tekrar Dene
                    </Link>
                    <Link
                      href="/cart"
                      className="rounded-md border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Sepete Dön
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

