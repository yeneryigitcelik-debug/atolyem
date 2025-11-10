import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { markPaid } from "@/lib/orderService";
import { verifyPaytrWebhook } from "@/lib/payments/paytr";
import { verifyIyzicoWebhook } from "@/lib/payments/iyzico";

/**
 * Payment Webhook API
 * Handles payment callbacks from gateways (idempotent)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gateway = request.headers.get("x-gateway") || body.gateway;

    if (!gateway || (gateway !== "IYZICO" && gateway !== "PAYTR")) {
      return NextResponse.json(
        { error: "Invalid gateway" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let isValid = false;

    if (gateway === "PAYTR") {
      const merchantSalt = process.env.PAYTR_MERCHANT_SALT || "sandbox_salt";
      isValid = await verifyPaytrWebhook(
        body.hash || body.HASH,
        merchantSalt,
        body.merchant_oid || body.merchantOid,
        body.status || body.Status,
        body.total_amount || body.totalAmount
      );
    } else if (gateway === "IYZICO") {
      const secretKey = process.env.IYZICO_SECRET_KEY || "sandbox";
      const requestBody = JSON.stringify(body);
      isValid = await verifyIyzicoWebhook(
        request.headers.get("x-iyzico-signature") || "",
        requestBody,
        secretKey
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Extract order info
    const orderId =
      gateway === "PAYTR"
        ? body.merchant_oid || body.merchantOid
        : body.basketId || body.orderId;
    const txnId =
      gateway === "PAYTR"
        ? body.payment_id || body.paymentId
        : body.paymentId || body.transactionId;
    const status =
      gateway === "PAYTR"
        ? body.status || body.Status
        : body.status || body.Status;
    const amountCents =
      gateway === "PAYTR"
        ? Math.round(parseFloat(body.total_amount || body.totalAmount) * 100)
        : Math.round(parseFloat(body.paidPrice || body.amount) * 100);

    if (!orderId || !txnId) {
      return NextResponse.json(
        { error: "Missing orderId or txnId" },
        { status: 400 }
      );
    }

    // Check if payment is successful
    if (status === "success" || status === "SUCCESS" || status === "COMPLETED") {
      // Mark order as paid (idempotent)
      await markPaid(orderId, {
        gateway: gateway as "IYZICO" | "PAYTR",
        txnId,
        amountCents,
        rawPayload: body,
      });

      return NextResponse.json({ success: true });
    } else {
      // Payment failed - log but don't change order status
      console.warn("Payment failed:", { orderId, txnId, status, gateway });
      return NextResponse.json({ success: false, status });
    }
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET handler for callback URLs (redirects from gateway)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gateway = searchParams.get("gateway");
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status");
  const txnId = searchParams.get("txnId") || searchParams.get("token");

  if (!gateway || !orderId || !status) {
    return NextResponse.redirect(
      new URL("/payments/fail", request.url)
    );
  }

  // In sandbox mode, simulate webhook call
  if (status === "success" && txnId) {
    try {
      const amountCents = searchParams.get("amount")
        ? parseInt(searchParams.get("amount")!, 10)
        : 0;

      await markPaid(orderId, {
        gateway: gateway as "IYZICO" | "PAYTR",
        txnId,
        amountCents,
        rawPayload: Object.fromEntries(searchParams.entries()),
      });

      return NextResponse.redirect(
        new URL(`/payments/success?orderId=${orderId}`, request.url)
      );
    } catch (error: any) {
      console.error("Callback error:", error);
      return NextResponse.redirect(
        new URL(`/payments/fail?orderId=${orderId}`, request.url)
      );
    }
  } else {
    return NextResponse.redirect(
      new URL(`/payments/fail?orderId=${orderId}`, request.url)
    );
  }
}

