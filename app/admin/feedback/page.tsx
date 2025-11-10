import { getAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import FeedbackAdminList from "./_components/FeedbackAdminList";

export default async function FeedbackAdminPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin-login");
  }

  // Get pending feedbacks
  const pendingFeedbacks = await (db as any).feedback?.findMany({
    where: { status: "PENDING" },
    include: {
      seller: {
        select: {
          id: true,
          displayName: true,
        },
      },
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

  // Get all feedbacks for stats
  const [totalFeedbacks, approvedFeedbacks, rejectedFeedbacks] = await Promise.all([
    (db as any).feedback?.count().catch(() => 0) || 0,
    (db as any).feedback?.count({ where: { status: "APPROVED" } }).catch(() => 0) || 0,
    (db as any).feedback?.count({ where: { status: "REJECTED" } }).catch(() => 0) || 0,
  ]);

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Geri Bildirim Yönetimi</h1>
          <p className="text-gray-600">Satıcı geri bildirimlerini onaylayın veya reddedin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Toplam Geri Bildirim</h3>
            <p className="text-3xl font-bold text-[#1F2937]">{totalFeedbacks}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Onay Bekleyen</h3>
            <p className="text-3xl font-bold text-yellow-600">{pendingFeedbacks.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Onaylanan</h3>
            <p className="text-3xl font-bold text-green-600">{approvedFeedbacks}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Reddedilen</h3>
            <p className="text-3xl font-bold text-red-600">{rejectedFeedbacks}</p>
          </div>
        </div>

        <FeedbackAdminList feedbacks={pendingFeedbacks} />
      </div>
    </div>
  );
}

