import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import InboxList from "../_components/InboxList";

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  // Gelen mesajları getir (başkasından gelen)
  const conversations = await db.conversation.findMany({
    where: {
      participants: {
        some: { userId },
      },
      messages: {
        some: {
          senderId: { not: userId }, // Başkasından gelen mesajlar
        },
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

  // Her konuşma için karşı tarafı ve son mesajı bul
  const items = conversations.map((convo) => {
    const otherParticipant = convo.participants.find((p) => p.userId !== userId);
    const lastMessage = convo.messages[0] || null;
    const unreadCount = convo.messages.filter(
      (m) => m.senderId !== userId
    ).length; // Basit unread sayısı (daha sonra isRead field eklenebilir)

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
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            body: lastMessage.body,
            imageId: lastMessage.imageId,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt.toISOString(),
          }
        : null,
      unreadCount,
    };
  });

  return <InboxList conversations={items} currentUserId={userId} />;
}

