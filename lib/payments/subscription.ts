import { db } from "@/lib/db";
import { initPaytrPayment } from "./paytr";
import { initIyzicoPayment } from "./iyzico";

export interface CreateSubscriptionRequest {
  userId: string;
  plan: "PREMIUM" | "ENTERPRISE";
  gateway: "IYZICO" | "PAYTR";
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  redirectUrl?: string;
  error?: string;
}

const PLAN_PRICES: Record<string, number> = {
  PREMIUM: 29900, // 299 TL in cents
  ENTERPRISE: 99900, // 999 TL in cents
};

/**
 * Creates a subscription and initiates payment
 */
export async function createSubscription(
  userId: string,
  plan: "PREMIUM" | "ENTERPRISE",
  gateway: "IYZICO" | "PAYTR" = "PAYTR"
): Promise<CreateSubscriptionResponse> {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { subscriptionId: "", error: "Kullanıcı bulunamadı" };
  }

  // Check if user already has active subscription
  const activeSubscriptions = await (db as any).subscription?.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    take: 1,
  }).catch(() => []);

  if (activeSubscriptions && activeSubscriptions.length > 0) {
    return { subscriptionId: "", error: "Zaten aktif bir aboneliğiniz var" };
  }

  const amountCents = PLAN_PRICES[plan];
  if (!amountCents) {
    return { subscriptionId: "", error: "Geçersiz plan" };
  }

  try {
    // Create subscription record
    const subscription = await (db as any).subscription.create({
      data: {
        userId,
        plan,
        status: "PENDING",
        amountCents,
        paymentGateway: gateway,
      },
    });

    // Calculate expiration (1 month from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Initialize payment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const callbackUrl = `${baseUrl}/api/subscriptions/webhook`;
    const successUrl = `${baseUrl}/premium?success=true`;
    const failUrl = `${baseUrl}/premium?error=true`;

    let redirectUrl: string | undefined;

    if (gateway === "PAYTR") {
      // Encode basket as Base64
      const basket = Buffer.from(JSON.stringify([`${plan} Abonelik`])).toString("base64");
      
      const paytrResponse = await initPaytrPayment({
        merchantId: process.env.PAYTR_MERCHANT_ID || "",
        merchantKey: process.env.PAYTR_MERCHANT_KEY || "",
        merchantSalt: process.env.PAYTR_MERCHANT_SALT || "",
        email: user.email,
        paymentAmount: amountCents / 100,
        merchantOid: subscription.id,
        userIp: "127.0.0.1", // Should be actual user IP in production
        userBasket: basket,
        callbackUrl,
        failUrl,
        currency: "TL",
      });

      if (paytrResponse.status === "failed" || paytrResponse.error) {
        await (db as any).subscription?.update({
          where: { id: subscription.id },
          data: { status: "CANCELED" },
        }).catch(() => {});
        return { subscriptionId: subscription.id, error: paytrResponse.error || "Ödeme başlatılamadı" };
      }

      // In sandbox, create a mock redirect URL
      // In production, PayTR would return a redirect URL
      if (paytrResponse.token) {
        redirectUrl = `${successUrl}&token=${paytrResponse.token}`;
      }
    } else if (gateway === "IYZICO") {
      const iyzicoResponse = await initIyzicoPayment({
        apiKey: process.env.IYZICO_API_KEY || "",
        secretKey: process.env.IYZICO_SECRET_KEY || "",
        baseUrl: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
        price: amountCents / 100,
        paidPrice: amountCents / 100,
        currency: "TRY",
        basketId: subscription.id,
        paymentCard: {
          cardHolderName: user.name || user.email,
          cardNumber: "",
          expireMonth: "",
          expireYear: "",
          cvc: "",
        },
        buyer: {
          id: userId,
          name: user.name || user.email,
          surname: user.name || "",
          email: user.email,
          identityNumber: "",
          lastLoginDate: user.createdAt.toISOString(),
          registrationDate: user.createdAt.toISOString(),
          registrationAddress: "",
          ip: "127.0.0.1",
          city: "",
          country: "Turkey",
        },
        billingAddress: {
          contactName: user.name || user.email,
          city: "",
          country: "Turkey",
          address: "",
        },
        shippingAddress: {
          contactName: user.name || user.email,
          city: "",
          country: "Turkey",
          address: "",
        },
        basketItems: [
          {
            id: subscription.id,
            name: `${plan} Abonelik`,
            category1: "Abonelik",
            itemType: "VIRTUAL",
            price: amountCents / 100,
          },
        ],
        callbackUrl,
      });

      if (iyzicoResponse.status === "failed" || iyzicoResponse.error) {
        await db.subscription.update({
          where: { id: subscription.id },
          data: { status: "CANCELED" },
        });
        return { subscriptionId: subscription.id, error: iyzicoResponse.error || "Ödeme başlatılamadı" };
      }

      // In sandbox, create a mock redirect URL
      if (iyzicoResponse.redirectUrl) {
        redirectUrl = iyzicoResponse.redirectUrl;
      }
    }

    return {
      subscriptionId: subscription.id,
      redirectUrl,
    };
  } catch (error: any) {
    console.error("Create subscription error:", error);
    return { subscriptionId: "", error: error.message || "Abonelik oluşturulamadı" };
  }
}

/**
 * Activates a subscription after successful payment
 */
export async function activateSubscription(subscriptionId: string): Promise<void> {
  await db.$transaction(async (tx: any) => {
    const subscription = await tx.subscription?.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error("Abonelik bulunamadı");
    }

    if (subscription.status === "ACTIVE") {
      return; // Already active
    }

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Update subscription
    await tx.subscription?.update({
      where: { id: subscriptionId },
      data: {
        status: "ACTIVE",
        expiresAt,
      },
    });

    // Update user premium status
    await db.user.update({
      where: { id: subscription.userId },
      data: {
        isPremium: true,
      } as any,
    });
  });
}

/**
 * Cancels a subscription
 */
export async function cancelSubscription(subscriptionId: string, userId: string): Promise<void> {
  await db.$transaction(async (tx: any) => {
    const subscription = await tx.subscription?.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== userId) {
      throw new Error("Abonelik bulunamadı veya yetkiniz yok");
    }

    await tx.subscription?.update({
      where: { id: subscriptionId },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
      },
    });

    // Check if user has any other active subscriptions
    const activeSubscriptions = await tx.subscription?.count({
      where: {
        userId,
        status: "ACTIVE",
        id: { not: subscriptionId },
      },
    });

    // If no other active subscriptions, remove premium status
    if (activeSubscriptions === 0) {
      await db.user.update({
        where: { id: userId },
        data: { isPremium: false } as any,
      });
    }
  });
}

