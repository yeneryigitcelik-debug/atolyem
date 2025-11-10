"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Mesaj oluşturma server action
 */
export async function createMessage(conversationId: string, body?: string, imageId?: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  if (!body && !imageId) {
    return { ok: false, error: "body veya imageId gerekli" };
  }

  try {
    // Yetki kontrolü: bu konuşmada participant mıyım?
    const isParticipant = await db.participant.findFirst({
      where: { conversationId, userId },
      select: { id: true },
    });

    if (!isParticipant) {
      return { ok: false, error: "FORBIDDEN" };
    }

    // Mesajı oluştur
    const message = await db.message.create({
      data: {
        conversationId,
        senderId: userId,
        body: body || null,
        imageId: imageId || null,
      },
    });

    // Konuşmanın updatedAt'ini güncelle
    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    revalidatePath("/messages");
    revalidatePath("/messages/inbox");
    revalidatePath("/messages/sent");

    return { ok: true, message };
  } catch (error: any) {
    console.error("Create message error:", error);
    return { ok: false, error: error.message || "Internal server error" };
  }
}

/**
 * Konuşma mesajlarını getirme server action
 */
export async function getConversationMessages(conversationId: string, cursor?: string, take: number = 30) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  try {
    // Yetki kontrolü
    const participant = await db.participant.findFirst({
      where: { conversationId, userId },
    });

    if (!participant) {
      return { ok: false, error: "FORBIDDEN" };
    }

    // Mesajları getir
    const messages = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const nextCursor = messages.length === take ? messages[messages.length - 1].id : null;

    // Mesajları ters çevir (en eski en üstte)
    const reversedMessages = messages.reverse();

    return {
      ok: true,
      items: reversedMessages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        body: msg.body,
        imageId: msg.imageId,
        createdAt: msg.createdAt.toISOString(),
      })),
      nextCursor,
    };
  } catch (error: any) {
    console.error("Get messages error:", error);
    return { ok: false, error: error.message || "Internal server error" };
  }
}

