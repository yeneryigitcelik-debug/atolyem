import { db } from "@/lib/db";
import Header from "./Header";

export default async function HeaderWrapper() {
  // Ana kategorileri ve alt kategorilerini çek
  const categories = await db.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return <Header categories={categories} />;
}

