import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const me = (session?.user as any)?.id;

    if (!me) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const take = Number(url.searchParams.get("take") ?? 30);

    // Yetki kontrolü: bu konuşmada participant mıyım?
    const part = await db.participant.findFirst({
      where: { conversationId: id, userId: me },
    });

    if (!part) {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }

    // Mesajları getir
    const items = await db.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const nextCursor = items.length === take ? items[items.length - 1].id : null;

    // Mesajları ters çevir (en eski en üstte)
    const reversedItems = items.reverse();

    return NextResponse.json({ ok: true, items: reversedItems, nextCursor });
  } catch (error: any) {
    console.error("Messages GET error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

