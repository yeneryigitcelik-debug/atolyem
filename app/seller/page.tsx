import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import CreateSellerForm from "./CreateSellerForm";

export default async function SellerPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { seller: true },
  });

  if (!user?.seller) {
    return <CreateSellerForm user={user} />;
  }

  // Seller ise kendi profil sayfasına yönlendir
  redirect(`/user/${userId}`);
}

