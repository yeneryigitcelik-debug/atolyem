import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  // Profile sayfasını user/[id] sayfasına yönlendir
  redirect(`/user/${userId}`);
}

