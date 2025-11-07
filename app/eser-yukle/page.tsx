import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import EserYukleForm from "./EserYukleForm";

export default async function EserYuklePage() {
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

  // Sadece alt kategorileri getir (parentId null olmayanlar)
  const categories = await db.category.findMany({
    where: { parentId: { not: null } },
    include: {
      parent: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { parent: { name: "asc" } },
      { name: "asc" },
    ],
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <Header />

            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[#1F2937] mb-8">Eserini Yükle</h1>
                <EserYukleForm categories={categories} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

