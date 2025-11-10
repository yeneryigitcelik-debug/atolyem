import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import FeedbackForm from "./_components/FeedbackForm";
import FeedbackList from "./_components/FeedbackList";

export default async function FeedbackPage() {
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

  // Get seller's recent orders for feedback
  const recentOrders = await db.order.findMany({
    where: {
      status: "COMPLETED",
      items: {
        some: {
          variant: {
            product: {
              sellerId,
            },
          },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  sellerId: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Get existing feedbacks
  const feedbacks = await (db as any).feedback?.findMany({
    where: { sellerId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: {
        select: {
          id: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF8F1" }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[#1F2937] mb-8">Geri Bildirimler</h1>

                <div className="space-y-8">
                  {/* Feedback Form */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#1F2937] mb-4">Yeni Geri Bildirim</h2>
                    <FeedbackForm sellerId={sellerId} recentOrders={recentOrders} />
                  </div>

                  {/* Feedback List */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#1F2937] mb-4">Geri Bildirim Geçmişi</h2>
                    <FeedbackList feedbacks={feedbacks} />
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

