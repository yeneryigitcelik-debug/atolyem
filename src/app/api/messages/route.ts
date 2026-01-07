import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/messages - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get conversations where user is either user1 or user2
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            accountType: true,
          },
        },
        user2: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            accountType: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Transform conversations to include the other participant
    const transformedConversations = conversations.map((conv) => {
      const otherUser = conv.user1Id === user.id ? conv.user2 : conv.user1;
      return {
        id: conv.id,
        participant: {
          id: otherUser.id,
          name: otherUser.displayName || "Kullanıcı",
          avatar: otherUser.avatarUrl,
          isArtist: otherUser.accountType === "SELLER" || otherUser.accountType === "BOTH",
        },
        lastMessage: conv.messages[0] || null,
        updatedAt: conv.lastMessageAt,
      };
    });

    return NextResponse.json({ conversations: transformedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/messages - Create a new conversation or get existing one
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId } = body;

    if (!recipientId) {
      return NextResponse.json({ error: "Recipient ID is required" }, { status: 400 });
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: recipientId },
          { user1Id: recipientId, user2Id: user.id },
        ],
      },
    });

    if (existingConversation) {
      return NextResponse.json({ conversation: existingConversation });
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        user1Id: user.id,
        user2Id: recipientId,
      },
    });

    return NextResponse.json({ conversation: newConversation }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

