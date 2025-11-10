/**
 * İyzico Payment Gateway Client (Sandbox)
 * Documentation: https://dev.iyzipay.com/
 */

export interface IyzicoInitRequest {
  apiKey: string;
  secretKey: string;
  price: number; // in cents
  paidPrice: number; // in cents (can include fees)
  currency: string; // "TRY"
  basketId: string; // order ID
  paymentCard?: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
  };
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    identityNumber?: string;
    city?: string;
    country?: string;
  };
  shippingAddress?: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  billingAddress?: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  callbackUrl: string;
}

export interface IyzicoInitResponse {
  status: "success" | "failed";
  paymentId?: string;
  redirectUrl?: string;
  error?: string;
}

/**
 * Initialize İyzico payment
 * Returns redirect URL for payment page
 */
export async function initIyzicoPayment(
  params: IyzicoInitRequest
): Promise<IyzicoInitResponse> {
  // In sandbox mode, we'll simulate the payment flow
  // In production, this would make an actual API call to İyzico

  const sandboxMode = process.env.IYZICO_SANDBOX === "true" || !process.env.IYZICO_API_KEY;

  if (sandboxMode) {
    // Return a mock payment ID for sandbox
    return {
      status: "success",
      paymentId: `sandbox_payment_${params.basketId}_${Date.now()}`,
      redirectUrl: `/api/payments/callback?gateway=iyzico&orderId=${params.basketId}&status=success`,
    };
  }

  // Production implementation would go here
  // This would make an HTTP POST to İyzico API
  // For now, we'll return sandbox response
  return {
    status: "success",
    paymentId: `sandbox_payment_${params.basketId}_${Date.now()}`,
    redirectUrl: `/api/payments/callback?gateway=iyzico&orderId=${params.basketId}&status=success`,
  };
}

/**
 * Verify İyzico webhook signature
 */
export async function verifyIyzicoWebhook(
  signature: string,
  requestBody: string,
  secretKey: string
): Promise<boolean> {
  // In sandbox, always return true
  if (process.env.IYZICO_SANDBOX === "true") {
    return true;
  }

  // Production signature verification
  const calculatedSignature = require("crypto")
    .createHmac("sha256", secretKey)
    .update(requestBody)
    .digest("base64");

  return calculatedSignature === signature;
}

