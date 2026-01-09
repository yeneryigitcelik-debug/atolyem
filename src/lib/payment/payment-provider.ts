/**
 * Payment Provider Abstraction Layer
 * 
 * Supports multiple payment providers (Iyzico, Stripe, etc.)
 * This allows switching providers without changing checkout logic
 */

export interface PaymentIntent {
  id: string;
  clientSecret?: string; // For Stripe
  checkoutFormContent?: string; // For Iyzico HTML form
  redirectUrl?: string; // For redirect-based flows
  status: "pending" | "succeeded" | "failed" | "canceled";
}

export interface CreatePaymentIntentParams {
  orderId: string;
  orderNumber: string;
  amountMinor: number; // Amount in smallest currency unit (kuruş for TRY)
  currency: string;
  buyerEmail: string;
  buyerName?: string;
  buyerPhone?: string;
  shippingAddress: Record<string, unknown>;
  metadata?: Record<string, string>;
  returnUrl?: string; // URL to redirect after payment
  webhookUrl?: string; // URL for payment webhook
}

export interface PaymentProvider {
  /**
   * Create a payment intent/checkout session
   * Returns payment intent with client secret or redirect URL
   */
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent>;

  /**
   * Verify webhook signature and parse payment event
   */
  verifyWebhook(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Promise<PaymentWebhookEvent>;

  /**
   * Get payment status by payment intent ID
   */
  getPaymentStatus(paymentIntentId: string): Promise<PaymentStatus>;
}

export interface PaymentWebhookEvent {
  type: "payment.succeeded" | "payment.failed" | "payment.canceled";
  paymentIntentId: string;
  orderId: string;
  orderNumber: string;
  amountMinor: number;
  currency: string;
  paidAt?: Date;
  failureReason?: string;
  metadata?: Record<string, string>;
}

export interface PaymentStatus {
  status: "pending" | "succeeded" | "failed" | "canceled";
  paidAt?: Date;
  failureReason?: string;
}

/**
 * Mock payment provider for development/testing
 * In production, replace with actual Iyzico/Stripe implementation
 */
export class MockPaymentProvider implements PaymentProvider {
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent> {
    // In development, return a mock payment intent
    // In production, this would call Iyzico/Stripe API
    return {
      id: `mock_pi_${Date.now()}`,
      status: "pending",
      // For mock, return a redirect URL that simulates payment
      redirectUrl: `/api/payment/mock-success?orderId=${params.orderId}`,
    };
  }

  async verifyWebhook(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Promise<PaymentWebhookEvent> {
    // Mock webhook verification
    const data = typeof payload === "string" ? JSON.parse(payload) : JSON.parse(payload.toString());
    
    return {
      type: data.type || "payment.succeeded",
      paymentIntentId: data.paymentIntentId,
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      amountMinor: data.amountMinor,
      currency: data.currency,
      paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
    };
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatus> {
    // Mock: always return pending
    return {
      status: "pending",
    };
  }
}

/**
 * Get payment provider instance
 * Uses environment variable to determine which provider to use
 */
export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER || "mock";

  switch (provider) {
    case "iyzico":
      // TODO: Implement IyzicoPaymentProvider
      throw new Error("Iyzico payment provider not yet implemented");
    case "stripe":
      // TODO: Implement StripePaymentProvider
      throw new Error("Stripe payment provider not yet implemented");
    case "mock":
    default:
      return new MockPaymentProvider();
  }
}

