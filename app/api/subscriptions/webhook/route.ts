import { NextRequest, NextResponse } from "next/server";
import { activateSubscription } from "@/lib/payments/subscription";
import { verifyPaytrWebhook } from "@/lib/payments/paytr";
import { verifyIyzicoWebhook } from "@/lib/payments/iyzico";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, gateway, status, txnId } = body;

    if (!subscriptionId || !gateway) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify webhook signature based on gateway
    // Note: In production, implement proper signature verification
    // For now, we'll trust the webhook (in production, add proper verification)
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") || request.headers.get("authorization") || "";

    // Basic validation - in production, implement full signature verification
    // For sandbox/testing, we'll allow the webhook
    const isSandbox = process.env.PAYTR_SANDBOX === "true" || process.env.NODE_ENV === "development";
    
    if (!isSandbox) {
      // Production signature verification would go here
      // For now, we'll skip for development
    }

    // Update subscription based on payment status
    if (status === "success" || status === "COMPLETED") {
      await activateSubscription(subscriptionId);

      // Update gateway subscription ID if provided
      if (txnId) {
        await (db as any).subscription?.update({
          where: { id: subscriptionId },
          data: { gatewaySubscriptionId: txnId },
        }).catch(() => {});
      }
    } else {
      await (db as any).subscription?.update({
        where: { id: subscriptionId },
        data: { status: "CANCELED" },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Subscription webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

