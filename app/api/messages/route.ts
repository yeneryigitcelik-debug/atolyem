import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const me = (session?.user as any)?.id;

    if (!me) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { conversationId, body, imageId } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ ok: false, error: "conversationId gerekli" }, { status: 400 });
    }

    if (!body && !imageId) {
      return NextResponse.json({ ok: false, error: "body veya imageId gerekli" }, { status: 400 });
    }

    // Yetki kontrolü: bu konuşmada participant mıyım?
    const isParticipant = await db.participant.findFirst({
      where: { conversationId, userId: me },
      select: { id: true },
    });

    if (!isParticipant) {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }

    // Mesajı oluştur
    const msg = await db.message.create({
      data: {
        conversationId,
        senderId: me,
        body: body || null,
        imageId: imageId || null,
      },
    });

    // Konuşmanın updatedAt'ini güncelle
    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true, message: msg });
  } catch (error: any) {
    console.error("Message POST error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

