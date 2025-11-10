import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, note } = body;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const feedback = await (db as any).feedback?.findUnique({
      where: { id },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    if (feedback.status !== "PENDING") {
      return NextResponse.json(
        { error: "Feedback already reviewed" },
        { status: 400 }
      );
    }

    await (db as any).feedback?.update({
      where: { id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        adminNote: note || null,
        reviewedBy: session.id,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Review feedback error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

