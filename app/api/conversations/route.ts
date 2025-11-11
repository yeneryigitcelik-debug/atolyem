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

    const { productId, orderId, sellerId } = await req.json();

    if (!sellerId) {
      return NextResponse.json({ ok: false, error: "sellerId gerekli" }, { status: 400 });
    }

    // Satıcının var olduğunu kontrol et
    const seller = await db.seller.findUnique({
      where: { id: sellerId },
      select: { userId: true },
    });

    if (!seller) {
      return NextResponse.json({ ok: false, error: "Satıcı bulunamadı" }, { status: 404 });
    }

    // Mevcut konuşmayı bul (aynı ürün/sipariş bağlamında veya genel konuşma)
    let convo = await db.conversation.findFirst({
      where: {
        ...(productId ? { productId } : {}),
        ...(orderId ? { orderId } : {}),
        // Eğer productId ve orderId yoksa, genel bir konuşma arıyoruz
        ...(!productId && !orderId ? { productId: null, orderId: null } : {}),
        participants: {
          some: { userId: me },
        },
      },
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
    });

    // Eğer konuşma bulunduysa, doğru katılımcıları içerdiğini kontrol et
    if (convo) {
      const participantUserIds = convo.participants.map((p) => p.userId);
      const hasBothUsers = participantUserIds.includes(me) && participantUserIds.includes(seller.userId);
      
      // Eğer her iki kullanıcı da katılımcı değilse, yeni konuşma oluştur
      if (!hasBothUsers) {
        convo = null;
      }
    }

    // Yoksa oluştur
    if (!convo) {
      // Alıcı ve satıcı rolleri
      const buyerRole = "BUYER";
      const sellerRole = "SELLER";

      convo = await db.conversation.create({
        data: {
          productId: productId || null,
          orderId: orderId || null,
          participants: {
            create: [
              { userId: me, role: buyerRole },
              { userId: seller.userId, role: sellerRole },
            ],
          },
        },
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
      });
    }

    return NextResponse.json({ ok: true, conversationId: convo.id, conversation: convo });
  } catch (error: any) {
    console.error("Conversation POST error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

