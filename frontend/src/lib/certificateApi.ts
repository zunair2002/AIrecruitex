/** `/api/certificate` — candidate/certificate/routes/certificate.routes.ts */
import { apiRequest } from "./api";
import type {
  CertificateView,
  CheckoutResult,
  ObjectId,
  PaymentConfirmation,
} from "./types";

/** POST /api/certificate/checkout — creates a Stripe Checkout session. */
export function createCheckout(
  sessionId: ObjectId,
  token: string | null,
): Promise<CheckoutResult> {
  return apiRequest<CheckoutResult>("/api/certificate/checkout", {
    method: "POST",
    body: { sessionId },
    token,
  });
}

/** POST /api/certificate/confirm-payment — polls Stripe for payment status. */
export function confirmPayment(
  sessionId: ObjectId,
  token: string | null,
): Promise<PaymentConfirmation> {
  return apiRequest<PaymentConfirmation>("/api/certificate/confirm-payment", {
    method: "POST",
    body: { sessionId },
    token,
  });
}

/**
 * POST /api/certificate/generate — issues the PDF. Requires a completed
 * session, a score above CERTIFICATE_PASS_SCORE, and a paid certificate.
 * Idempotent: an already-issued certificate is returned as-is.
 */
export function generateCertificate(
  sessionId: ObjectId,
  token: string | null,
): Promise<CertificateView> {
  return apiRequest<CertificateView>("/api/certificate/generate", {
    method: "POST",
    body: { sessionId },
    token,
  });
}

/** GET /api/certificate/:sessionId — 404s until the certificate is generated. */
export function getCertificate(
  sessionId: ObjectId,
  token: string | null,
  signal?: AbortSignal,
): Promise<CertificateView> {
  return apiRequest<CertificateView>(`/api/certificate/${sessionId}`, {
    token,
    signal,
  });
}
