import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSubscription } from "@/lib/payments/subscription";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, gateway = "PAYTR" } = body;

    if (!plan || (plan !== "PREMIUM" && plan !== "ENTERPRISE")) {
      return NextResponse.json(
        { error: "Geçersiz plan. PREMIUM veya ENTERPRISE seçiniz." },
        { status: 400 }
      );
    }

    const result = await createSubscription(userId, plan, gateway);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      subscriptionId: result.subscriptionId,
      redirectUrl: result.redirectUrl,
    });
  } catch (error: any) {
    console.error("Create subscription API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

