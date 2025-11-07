import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const me = (session?.user as any)?.id;

    if (!me) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const convos = await db.conversation.findMany({
      where: {
        participants: {
          some: { userId: me },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
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
        },
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
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: {
              orderBy: { sort: "asc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Her konuşma için karşı tarafı bul
    const items = convos.map((convo) => {
      const otherParticipant = convo.participants.find((p) => p.userId !== me);
      const lastMessage = convo.messages[0] || null;

      return {
        id: convo.id,
        productId: convo.productId,
        orderId: convo.orderId,
        createdAt: convo.createdAt,
        updatedAt: convo.updatedAt,
        otherParticipant: otherParticipant
          ? {
              id: otherParticipant.user.id,
              name: otherParticipant.user.name || otherParticipant.user.email,
              email: otherParticipant.user.email,
              image: otherParticipant.user.image,
              role: otherParticipant.role,
            }
          : null,
        product: convo.product,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              body: lastMessage.body,
              imageId: lastMessage.imageId,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
            }
          : null,
      };
    });

    return NextResponse.json({ ok: true, items });
  } catch (error: any) {
    console.error("Conversations GET error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

