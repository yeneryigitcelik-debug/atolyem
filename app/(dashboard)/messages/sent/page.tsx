import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SentList from "../_components/SentList";

export default async function SentPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  // Gönderilen mesajları getir (kullanıcının gönderdiği)
  const conversations = await db.conversation.findMany({
    where: {
      participants: {
        some: { userId },
      },
      messages: {
        some: {
          senderId: userId, // Kullanıcının gönderdiği mesajlar
        },
      },
    },
    include: {
      messages: {
        where: {
          senderId: userId, // Sadece kullanıcının gönderdiği mesajlar
        },
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

  // Her konuşma için karşı tarafı ve son gönderilen mesajı bul
  const items = conversations.map((convo) => {
    const otherParticipant = convo.participants.find((p) => p.userId !== userId);
    const lastSentMessage = convo.messages[0] || null;

    return {
      id: convo.id,
      productId: convo.productId,
      orderId: convo.orderId,
      createdAt: convo.createdAt.toISOString(),
      updatedAt: convo.updatedAt.toISOString(),
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
      lastMessage: lastSentMessage
        ? {
            id: lastSentMessage.id,
            body: lastSentMessage.body,
            imageId: lastSentMessage.imageId,
            senderId: lastSentMessage.senderId,
            createdAt: lastSentMessage.createdAt.toISOString(),
          }
        : null,
    };
  });

  return <SentList conversations={items} currentUserId={userId} />;
}

