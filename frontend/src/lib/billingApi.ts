/**
 * `/api/billing` — candidate Premium subscription (Stripe Checkout + Billing).
 *
 * Upgrading sends the browser to Stripe Checkout; Stripe returns to
 * /candidate/billing?checkout=success&session_id=… (or ?checkout=cancelled),
 * where the page confirms the session. Renewals, cancellations and failed
 * payments are also applied server-side from Stripe webhooks.
 */
import { apiRequest } from "./api";
import type {
  BillingPlans,
  ObjectId,
  Payment,
  SubscriptionStatus,
  User,
  UserPlan,
} from "./types";

/** GET /api/billing/plans — public; prices and limits of each plan. */
export function getBillingPlans(signal?: AbortSignal): Promise<BillingPlans> {
  return apiRequest<BillingPlans>("/api/billing/plans", { signal });
}

/** GET /api/billing/subscription — candidate only; the plan in effect and what can be done next. */
export function getSubscription(
  token: string | null,
  signal?: AbortSignal,
): Promise<SubscriptionStatus> {
  return apiRequest<SubscriptionStatus>("/api/billing/subscription", { token, signal });
}

/**
 * POST /api/billing/checkout — candidate only. Answers the Stripe Checkout URL
 * to send the browser to. 409 when already Premium, 503 when Stripe isn't set up.
 */
export function startCheckout(token: string | null): Promise<{ checkoutUrl: string }> {
  return apiRequest<{ checkoutUrl: string }>("/api/billing/checkout", {
    method: "POST",
    token,
  });
}

/** POST /api/billing/checkout/confirm — after Stripe redirects back with `session_id`. */
export function confirmCheckout(
  sessionId: string,
  token: string | null,
): Promise<SubscriptionStatus> {
  return apiRequest<SubscriptionStatus>("/api/billing/checkout/confirm", {
    method: "POST",
    body: { sessionId },
    token,
  });
}

/** POST /api/billing/cancel — cancels at period end; Premium stays until `currentPeriodEnd`. */
export function cancelSubscription(token: string | null): Promise<SubscriptionStatus> {
  return apiRequest<SubscriptionStatus>("/api/billing/cancel", { method: "POST", token });
}

/** POST /api/billing/resume — undoes a pending cancellation. */
export function resumeSubscription(token: string | null): Promise<SubscriptionStatus> {
  return apiRequest<SubscriptionStatus>("/api/billing/resume", { method: "POST", token });
}

/** GET /api/billing/payments — candidate only; subscription invoices and certificate payments, newest first. */
export function listPayments(
  token: string | null,
  signal?: AbortSignal,
): Promise<Payment[]> {
  return apiRequest<Payment[]>("/api/billing/payments", { token, signal });
}

/**
 * PATCH /api/admin/users/:userId/plan — admin only, candidates only. `expiresAt`
 * (ISO) ends a Premium grant; null/omitted = no end date. 409 when downgrading a
 * candidate who still has an active Stripe subscription.
 */
export function setUserPlan(
  userId: ObjectId,
  input: { plan: UserPlan; expiresAt?: string | null },
  token: string | null,
): Promise<User> {
  return apiRequest<User>(`/api/admin/users/${userId}/plan`, {
    method: "PATCH",
    body: input,
    token,
  });
}
