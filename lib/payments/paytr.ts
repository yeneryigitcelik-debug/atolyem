"use server";

/**
 * PayTR Payment Gateway Client (Sandbox)
 * Documentation: https://dev.paytr.com/
 */

export interface PaytrInitRequest {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  email: string;
  paymentAmount: number; // in cents
  merchantOid: string; // order ID
  userIp: string;
  userAddress?: string;
  userBasket: string; // Base64 encoded JSON array
  callbackUrl: string;
  failUrl: string;
  currency: string; // "TL"
}

export interface PaytrInitResponse {
  status: "success" | "failed";
  token?: string;
  error?: string;
}

/**
 * Initialize PayTR payment
 * Returns redirect URL for payment page
 */
export async function initPaytrPayment(
  params: PaytrInitRequest
): Promise<PaytrInitResponse> {
  // In sandbox mode, we'll simulate the payment flow
  // In production, this would make an actual API call to PayTR

  const sandboxMode = process.env.PAYTR_SANDBOX === "true" || !process.env.PAYTR_MERCHANT_ID;

  if (sandboxMode) {
    // Return a mock token for sandbox
    return {
      status: "success",
      token: `sandbox_token_${params.merchantOid}_${Date.now()}`,
    };
  }

  // Production implementation would go here
  // This would make an HTTP POST to PayTR API
  // For now, we'll return sandbox response
  return {
    status: "success",
    token: `sandbox_token_${params.merchantOid}_${Date.now()}`,
  };
}

/**
 * Verify PayTR webhook signature
 */
export function verifyPaytrWebhook(
  hash: string,
  merchantSalt: string,
  merchantOid: string,
  status: string,
  totalAmount: string
): boolean {
  // In sandbox, always return true
  if (process.env.PAYTR_SANDBOX === "true") {
    return true;
  }

  // Production signature verification
  const calculatedHash = require("crypto")
    .createHash("sha256")
    .update(
      `${merchantOid}${merchantSalt}${status}${totalAmount}`
    )
    .digest("hex");

  return calculatedHash === hash;
}

