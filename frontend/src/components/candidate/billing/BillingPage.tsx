"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, BadgeCheck, CreditCard, ExternalLink, FileText, Receipt } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import {
  cancelSubscription,
  confirmCheckout,
  getBillingPlans,
  getSubscription,
  listPayments,
  resumeSubscription,
  startCheckout,
} from "@/lib/billingApi";
import { formatDate } from "@/lib/format";
import { useApiResource } from "@/lib/useApiResource";
import {
  FeatureUnavailable,
  isEndpointMissing,
} from "@/components/shared/FeatureUnavailable";
import type { BillingPlan, Payment, SubscriptionStatus } from "@/lib/types";
import { PlanBadge } from "@/components/candidate/plan/PlanBits";
import { PortalPage } from "@/components/dashboard/primitives";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import {
  Card,
  EmptyState,
  ErrorBlock,
  InlineError,
  InlineSuccess,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import {
  tableClass,
  tableScrollClass,
  tdClass,
  thClass,
  trClass,
} from "@/components/ui/table";

export const BILLING_PATH = "/candidate/billing";

/** "$29.00" from 2900 + "usd"; falls back to a plain number for an unknown currency. */
export function formatMoney(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

const intervalLabel = (interval: BillingPlan["interval"]) =>
  interval === "year" ? "year" : "month";

/** One-line summary of where the candidate's plan stands, plus a badge tone. */
function describeStatus(sub: SubscriptionStatus): {
  label: string;
  tone: BadgeTone;
  detail: string;
} {
  const endsOn = sub.planExpiresAt ?? sub.currentPeriodEnd;

  if (sub.plan === "premium" && sub.source === "admin") {
    return {
      label: "Granted",
      tone: "brand",
      detail: sub.planExpiresAt
        ? `Premium was granted by the AiRecruitex team until ${formatDate(sub.planExpiresAt)}.`
        : "Premium was granted by the AiRecruitex team with no end date.",
    };
  }

  if (sub.plan === "premium") {
    if (sub.cancelAtPeriodEnd) {
      return {
        label: `Cancels ${formatDate(endsOn)}`,
        tone: "warning",
        detail: `Your subscription is cancelled. You keep Premium until ${formatDate(endsOn)}, then move to the Free plan.`,
      };
    }
    if (sub.status === "past_due" || sub.status === "unpaid") {
      return {
        label: "Payment failed",
        tone: "danger",
        detail: `Your last renewal payment didn't go through. Stripe will retry it; Premium stays active until ${formatDate(endsOn)}.`,
      };
    }
    if (sub.status === "trialing") {
      return {
        label: "Trial",
        tone: "info",
        detail: `You're on a free trial. The first payment is taken on ${formatDate(sub.currentPeriodEnd)}.`,
      };
    }
    return {
      label: "Active",
      tone: "success",
      detail: sub.currentPeriodEnd
        ? `Your subscription renews automatically on ${formatDate(sub.currentPeriodEnd)}.`
        : "Your subscription is active.",
    };
  }

  if (sub.status === "incomplete") {
    return {
      label: "Checkout incomplete",
      tone: "warning",
      detail: "Your last checkout wasn't completed, so no payment was taken. You can try again.",
    };
  }
  if (sub.status === "canceled" || sub.status === "incomplete_expired") {
    return {
      label: "Ended",
      tone: "neutral",
      detail: "Your Premium subscription has ended. You're on the Free plan.",
    };
  }
  return {
    label: "Free",
    tone: "neutral",
    detail: "You're on the Free plan.",
  };
}

const PAYMENT_STATUS: Record<Payment["status"], { label: string; tone: BadgeTone }> = {
  paid: { label: "Paid", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

/**
 * /candidate/billing — the candidate's plan, the Premium upgrade (Stripe
 * Checkout), cancel / resume, and payment history with invoice links.
 *
 * Stripe sends the browser back here with ?checkout=success&session_id=… or
 * ?checkout=cancelled. A success return is confirmed with the backend, the
 * signed-in user is refreshed so `plan` updates everywhere, and the query
 * string is dropped.
 */
export function BillingPage() {
  const { token, refresh } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read once: the query string is stripped right after.
  const [returned] = useState(() => ({
    checkout: searchParams.get("checkout"),
    sessionId: searchParams.get("session_id"),
  }));
  const [confirming, setConfirming] = useState(
    returned.checkout === "success" && Boolean(returned.sessionId),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [cancelledNotice, setCancelledNotice] = useState(
    returned.checkout === "cancelled",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"checkout" | "cancel" | "resume" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const confirmStarted = useRef(false);

  const plans = useApiResource((signal) => getBillingPlans(signal), []);
  const subscription = useApiResource(
    (signal) => getSubscription(token, signal),
    [token],
    { enabled: Boolean(token) },
  );
  const payments = useApiResource(
    (signal) => listPayments(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  /**
   * The backend currently has no /api/billing router at all, so every call
   * here comes back 404. Detect that once and say so plainly, rather than
   * stacking three "Route not found" error blocks down the page.
   */
  const billingUnavailable =
    isEndpointMissing(subscription.error) || isEndpointMissing(plans.error);

  // Drop ?checkout / ?session_id so a reload doesn't confirm or notify twice.
  useEffect(() => {
    if (returned.checkout) router.replace(BILLING_PATH, { scroll: false });
  }, [returned.checkout, router]);

  useEffect(() => {
    if (!token || !returned.sessionId || returned.checkout !== "success") return;
    if (confirmStarted.current) return;
    confirmStarted.current = true;

    confirmCheckout(returned.sessionId, token)
      .then(async (status) => {
        subscription.setData(status);
        setNotice(
          status.plan === "premium"
            ? "Payment received — welcome to Premium!"
            : "Your payment is still being processed. Your plan updates here as soon as Stripe confirms it.",
        );
        payments.reload();
        await refresh();
      })
      .catch((err) => setError(toErrorMessage(err)))
      .finally(() => setConfirming(false));
    // Runs once per return from Stripe; the resources are stable handles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, returned.sessionId, returned.checkout]);

  const premiumPlan = plans.data?.plans.find((plan) => plan.id === "premium");
  const freePlan = plans.data?.plans.find((plan) => plan.id === "free");
  const checkoutAvailable = plans.data?.checkoutAvailable ?? false;

  const upgrade = async () => {
    setBusy("checkout");
    setError(null);
    try {
      const { checkoutUrl } = await startCheckout(token);
      window.location.assign(checkoutUrl);
    } catch (err) {
      setError(toErrorMessage(err));
      setBusy(null);
    }
  };

  const changeSubscription = async (action: "cancel" | "resume") => {
    setBusy(action);
    setError(null);
    try {
      const status =
        action === "cancel"
          ? await cancelSubscription(token)
          : await resumeSubscription(token);
      subscription.setData(status);
      setNotice(
        action === "cancel"
          ? `Subscription cancelled. You keep Premium until ${formatDate(status.planExpiresAt ?? status.currentPeriodEnd)}.`
          : "Your subscription will renew as usual.",
      );
      setConfirmCancel(false);
      await refresh();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <PortalPage>
      <PageHeader
        title="Plan & billing"
        description="Your plan, Premium subscription and payment history."
        icon={<CreditCard />}
      />

      {confirming && <LoadingBlock label="Confirming your payment…" />}
      <InlineSuccess message={notice} />
      {cancelledNotice && !notice && (
        <div className="flex items-start justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2.5 text-sm text-body ring-1 ring-inset ring-line">
          <span>Checkout was cancelled — you haven&apos;t been charged.</span>
          <button
            type="button"
            onClick={() => setCancelledNotice(false)}
            className="text-xs font-medium text-muted hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      )}
      <InlineError message={error} />

      {billingUnavailable ? (
        <FeatureUnavailable
          title="Billing isn't enabled on this server yet"
          description="The plans, subscription and payment endpoints aren't part of this backend build, so there's nothing to show here. Premium is still honoured everywhere it's checked — this page is only the place to buy and manage it."
        />
      ) : subscription.isLoading ? (
        <LoadingBlock label="Loading your plan…" variant="skeleton" rows={3} />
      ) : subscription.error ? (
        <ErrorBlock message={subscription.error} onRetry={subscription.reload} />
      ) : subscription.data ? (
        <PlanCard
          sub={subscription.data}
          premiumPlan={premiumPlan}
          freePlan={freePlan}
          plansError={plans.error}
          checkoutAvailable={checkoutAvailable}
          plansLoading={plans.isLoading}
          busy={busy}
          onUpgrade={upgrade}
          onCancel={() => setConfirmCancel(true)}
          onResume={() => changeSubscription("resume")}
        />
      ) : null}

      {!billingUnavailable && (
      <Card
        title="Payment history"
        description="Premium invoices and certificate payments."
        padding="none"
      >
        {payments.isLoading ? (
          <LoadingBlock label="Loading payments…" />
        ) : payments.error ? (
          <div className="p-4 sm:p-6">
            <ErrorBlock message={payments.error} onRetry={payments.reload} />
          </div>
        ) : !payments.data || payments.data.length === 0 ? (
          <EmptyState
            bare
            icon={<Receipt />}
            title="No payments yet"
            description="Invoices appear here after your first payment."
          />
        ) : (
          <PaymentTable payments={payments.data} />
        )}
      </Card>
      )}

      <ConfirmDialog
        open={confirmCancel}
        tone="danger"
        title="Cancel Premium?"
        description={
          subscription.data
            ? `You keep Premium until ${formatDate(subscription.data.planExpiresAt ?? subscription.data.currentPeriodEnd)}. After that your account moves to the Free plan and you won't be charged again.`
            : undefined
        }
        confirmLabel="Cancel subscription"
        cancelLabel="Keep Premium"
        loading={busy === "cancel"}
        onConfirm={() => changeSubscription("cancel")}
        onClose={() => setConfirmCancel(false)}
      />
    </PortalPage>
  );
}

function PlanCard({
  sub,
  premiumPlan,
  freePlan,
  plansError,
  plansLoading,
  checkoutAvailable,
  busy,
  onUpgrade,
  onCancel,
  onResume,
}: {
  sub: SubscriptionStatus;
  premiumPlan?: BillingPlan;
  freePlan?: BillingPlan;
  plansError: string | null;
  plansLoading: boolean;
  checkoutAvailable: boolean;
  busy: "checkout" | "cancel" | "resume" | null;
  onUpgrade: () => void;
  onCancel: () => void;
  onResume: () => void;
}) {
  const status = describeStatus(sub);
  const price = premiumPlan
    ? `${formatMoney(premiumPlan.priceCents, premiumPlan.currency)} / ${intervalLabel(premiumPlan.interval)}`
    : null;

  return (
    <Card>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-ink">Current plan</h2>
            <PlanBadge plan={sub.plan} />
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-body">{status.detail}</p>
          {sub.plan === "premium" && sub.currentPeriodEnd && sub.source === "stripe" && (
            <p className="text-sm text-muted">
              {sub.cancelAtPeriodEnd ? "Ends on" : "Next billing date"}:{" "}
              <span className="tabular-nums text-body">{formatDate(sub.currentPeriodEnd)}</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col lg:items-stretch">
          {sub.canUpgrade && (
            <Button
              onClick={onUpgrade}
              loading={busy === "checkout"}
              disabled={!checkoutAvailable || busy !== null || plansLoading}
              leadingIcon={<BadgeCheck />}
            >
              {price ? `Upgrade — ${price}` : "Upgrade to Premium"}
            </Button>
          )}
          {sub.canResume && (
            <Button onClick={onResume} loading={busy === "resume"} disabled={busy !== null}>
              Keep Premium
            </Button>
          )}
          {sub.canCancel && (
            <Button variant="danger-soft" onClick={onCancel} disabled={busy !== null}>
              Cancel subscription
            </Button>
          )}
        </div>
      </div>

      {sub.canUpgrade && !plansLoading && !checkoutAvailable && (
        <p className="mt-3 text-sm text-muted">
          {plansError
            ? "Plan prices couldn't be loaded, so upgrading isn't available right now."
            : "Online payments aren't available right now. Please try again later or contact support."}
        </p>
      )}

      {(freePlan || premiumPlan) && (
        <div className="mt-6 grid gap-3 border-t border-line-soft pt-5 sm:grid-cols-2">
          {[freePlan, premiumPlan].map(
            (plan) =>
              plan && (
                <div
                  key={plan.id}
                  className={`rounded-lg p-4 ring-1 ring-inset ${
                    plan.id === sub.plan ? "bg-brand-50/60 ring-brand-200" : "ring-line"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{plan.name}</p>
                    <p className="text-sm tabular-nums text-muted">
                      {plan.priceCents === 0
                        ? "Free"
                        : `${formatMoney(plan.priceCents, plan.currency)} / ${intervalLabel(plan.interval)}`}
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-sm text-body">
                    <li className="flex items-start gap-2">
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      {plan.practiceInterviewsPerDay} practice interviews per day
                    </li>
                    <li className="flex items-start gap-2">
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      {plan.premiumCourses ? "Every course, including Premium" : "Free learning courses"}
                    </li>
                    {plan.trialDays > 0 && (
                      <li className="flex items-start gap-2">
                        <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        {plan.trialDays}-day free trial
                      </li>
                    )}
                  </ul>
                </div>
              ),
          )}
        </div>
      )}
    </Card>
  );
}

function PaymentTable({ payments }: { payments: Payment[] }) {
  return (
    <div className={tableScrollClass}>
      <table className={tableClass}>
        <thead>
          <tr>
            <th scope="col" className={thClass}>
              Date
            </th>
            <th scope="col" className={thClass}>
              Description
            </th>
            <th scope="col" className={`${thClass} text-right`}>
              Amount
            </th>
            <th scope="col" className={thClass}>
              Status
            </th>
            <th scope="col" className={thClass}>
              Invoice
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => {
            const status = PAYMENT_STATUS[payment.status] ?? {
              label: payment.status,
              tone: "neutral" as const,
            };
            return (
              <tr key={payment._id} className={trClass}>
                <td className={`${tdClass} whitespace-nowrap tabular-nums`}>
                  {formatDate(payment.createdAt)}
                </td>
                <td className={tdClass}>
                  <p className="text-ink">{payment.description}</p>
                  {payment.periodStart && payment.periodEnd && (
                    <p className="text-xs text-muted tabular-nums">
                      {formatDate(payment.periodStart)} – {formatDate(payment.periodEnd)}
                    </p>
                  )}
                  {payment.invoiceNumber && (
                    <p className="text-xs text-muted">Invoice {payment.invoiceNumber}</p>
                  )}
                </td>
                <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>
                  {formatMoney(payment.amountCents, payment.currency)}
                </td>
                <td className={tdClass}>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </td>
                <td className={`${tdClass} whitespace-nowrap`}>
                  <div className="flex items-center gap-3">
                    {payment.hostedInvoiceUrl && (
                      <a
                        href={payment.hostedInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                      >
                        View <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {payment.invoicePdfUrl && (
                      <a
                        href={payment.invoicePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                      >
                        PDF <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {!payment.hostedInvoiceUrl && !payment.invoicePdfUrl && (
                      <span className="text-sm text-subtle">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
