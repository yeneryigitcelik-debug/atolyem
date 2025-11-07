import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { initPaytrPayment } from "@/lib/payments/paytr";
import { initIyzicoPayment } from "@/lib/payments/iyzico";

/**
 * Payment Init API
 * Creates payment session and redirects to gateway
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, gateway } = body;

    if (!orderId || !gateway) {
      return NextResponse.json(
        { error: "orderId and gateway are required" },
        { status: 400 }
      );
    }

    if (gateway !== "IYZICO" && gateway !== "PAYTR") {
      return NextResponse.json(
        { error: "Invalid gateway. Use IYZICO or PAYTR" },
        { status: 400 }
      );
    }

    // Get order
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        user: true,
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Order is not in PENDING status" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const callbackUrl = `${baseUrl}/api/payments/callback`;
    const successUrl = `${baseUrl}/payments/success?orderId=${orderId}`;
    const failUrl = `${baseUrl}/payments/fail?orderId=${orderId}`;

    if (gateway === "PAYTR") {
      // Prepare basket (Base64 encoded JSON)
      const basket = order.items.map((item) => [
        item.variant.product.title,
        (item.priceCents / 100).toFixed(2),
        item.qty,
      ]);
      const basketBase64 = Buffer.from(JSON.stringify(basket)).toString("base64");

      const paytrResponse = await initPaytrPayment({
        merchantId: process.env.PAYTR_MERCHANT_ID || "sandbox",
        merchantKey: process.env.PAYTR_MERCHANT_KEY || "sandbox_key",
        merchantSalt: process.env.PAYTR_MERCHANT_SALT || "sandbox_salt",
        email: order.user.email,
        paymentAmount: order.totalCents,
        merchantOid: order.id,
        userIp: request.headers.get("x-forwarded-for") || "127.0.0.1",
        userAddress: order.address?.addressLine || "",
        userBasket: basketBase64,
        callbackUrl,
        failUrl,
        currency: "TL",
      });

      if (paytrResponse.status === "success" && paytrResponse.token) {
        // In sandbox, redirect to callback with success
        // In production, redirect to PayTR payment page
        const redirectUrl = process.env.PAYTR_SANDBOX === "true"
          ? `${callbackUrl}?gateway=paytr&orderId=${orderId}&status=success&token=${paytrResponse.token}`
          : `https://www.paytr.com/odeme/guvenli/${paytrResponse.token}`;

        return NextResponse.json({ redirectUrl });
      } else {
        return NextResponse.json(
          { error: paytrResponse.error || "Payment initialization failed" },
          { status: 500 }
        );
      }
    } else if (gateway === "IYZICO") {
      const iyzicoResponse = await initIyzicoPayment({
        apiKey: process.env.IYZICO_API_KEY || "sandbox",
        secretKey: process.env.IYZICO_SECRET_KEY || "sandbox",
        price: order.totalCents,
        paidPrice: order.totalCents,
        currency: "TRY",
        basketId: order.id,
        buyer: {
          id: order.user.id,
          name: order.user.name || "Customer",
          surname: "",
          email: order.user.email,
        },
        shippingAddress: order.address
          ? {
              contactName: order.address.title || "Address",
              city: order.address.city || "",
              country: "Turkey",
              address: order.address.addressLine || "",
            }
          : undefined,
        callbackUrl,
      });

      if (iyzicoResponse.status === "success" && iyzicoResponse.redirectUrl) {
        return NextResponse.json({ redirectUrl: iyzicoResponse.redirectUrl });
      } else {
        return NextResponse.json(
          { error: iyzicoResponse.error || "Payment initialization failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid gateway" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Payment init error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

