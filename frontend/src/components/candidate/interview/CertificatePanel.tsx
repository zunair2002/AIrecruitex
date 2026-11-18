"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isAbortError, toErrorMessage } from "@/lib/api";
import {
  confirmPayment,
  createCheckout,
  generateCertificate,
  getCertificate,
} from "@/lib/certificateApi";
import type {
  CertificateView,
  InterviewResultVerdict,
  ObjectId,
} from "@/lib/types";
import { Award, CreditCard, Download, FileCheck2, RefreshCw } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card, InlineError, InlineSuccess } from "@/components/ui/Feedback";

/**
 * The certificate flow, exactly as the backend gates it:
 * 1. session completed AND score > CERTIFICATE_PASS_SCORE (403 otherwise)
 * 2. POST /checkout -> Stripe Checkout URL
 * 3. POST /confirm-payment -> flips certificatePayment.paid once Stripe says paid
 * 4. POST /generate -> renders + uploads the PDF (402 while unpaid)
 *
 * Stripe's success_url points at the backend's own APP_BASE_URL, so after
 * paying the candidate comes back here and presses "I've paid" to confirm.
 */
export function CertificatePanel({
  sessionId,
  score,
  result,
  certificatePaid,
}: {
  sessionId: ObjectId;
  score?: number;
  result?: InterviewResultVerdict;
  certificatePaid: boolean;
}) {
  const { token } = useAuth();
  const [certificate, setCertificate] = useState<CertificateView | null>(null);
  const [isPaid, setIsPaid] = useState(certificatePaid);
  const [busy, setBusy] = useState<null | "checkout" | "confirm" | "generate">(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // An already-issued certificate is fetched up front; a 404 just means it
  // has not been generated yet, which is the normal first-visit case.
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    getCertificate(sessionId, token, controller.signal)
      .then(setCertificate)
      .catch((err) => {
        if (isAbortError(err)) return;
      });
    return () => controller.abort();
  }, [sessionId, token]);

  const run = async (
    kind: "checkout" | "confirm" | "generate",
    action: () => Promise<void>,
  ) => {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const handleCheckout = () =>
    run("checkout", async () => {
      const { checkoutUrl } = await createCheckout(sessionId, token);
      window.location.href = checkoutUrl;
    });

  const handleConfirm = () =>
    run("confirm", async () => {
      const { paid } = await confirmPayment(sessionId, token);
      setIsPaid(paid);
      setNotice(
        paid
          ? "Payment confirmed. You can generate your certificate now."
          : "Stripe hasn't recorded this payment yet. Try again in a moment.",
      );
    });

  const handleGenerate = () =>
    run("generate", async () => {
      setCertificate(await generateCertificate(sessionId, token));
      setNotice("Certificate issued.");
    });

  const title = (
    <span className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
      >
        <Award className="h-4 w-4" />
      </span>
      Certificate
    </span>
  );

  if (result === "fail") {
    return (
      <Card title={title}>
        <p className="text-sm text-muted">
          Certificates are issued only for passing interviews. Practice again to
          raise your score, then come back here.
        </p>
      </Card>
    );
  }

  return (
    <Card title={title}>
      {certificate ? (
        <div className="space-y-4">
          <InlineSuccess message="Your certificate has been issued." />
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0 rounded-lg border border-line-soft bg-surface-2 p-4">
              <dt className="text-xs font-medium text-muted">Certificate ID</dt>
              <dd className="mt-1 break-all font-mono text-sm font-semibold text-ink">
                {certificate.certId}
              </dd>
            </div>
            <div className="min-w-0 rounded-lg border border-line-soft bg-surface-2 p-4">
              <dt className="text-xs font-medium text-muted">
                Score on certificate
              </dt>
              <dd className="mt-1 font-display text-lg font-semibold tabular-nums text-ink">
                {certificate.score}%
              </dd>
            </div>
          </dl>
          <a
            href={certificate.certificateUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClass({ className: "w-full sm:w-auto" })}
          >
            <Download aria-hidden="true" />
            Download certificate PDF
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-body">
            {isPaid
              ? "Payment received — generate your certificate PDF."
              : "A certificate is available for this interview once payment is complete."}
            {typeof score === "number" && (
              <>
                {" "}
                Your score:{" "}
                <span className="font-semibold tabular-nums text-ink">{score}%</span>.
              </>
            )}
          </p>

          {error && <InlineError message={error} />}
          {notice && <InlineSuccess message={notice} />}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {!isPaid && (
              <>
                <Button
                  onClick={handleCheckout}
                  disabled={busy !== null}
                  loading={busy === "checkout"}
                  leadingIcon={<CreditCard aria-hidden="true" />}
                >
                  {busy === "checkout"
                    ? "Opening checkout…"
                    : "Pay for certificate"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleConfirm}
                  disabled={busy !== null}
                  loading={busy === "confirm"}
                  leadingIcon={<RefreshCw aria-hidden="true" />}
                >
                  {busy === "confirm" ? "Checking…" : "I've already paid"}
                </Button>
              </>
            )}
            {isPaid && (
              <Button
                onClick={handleGenerate}
                disabled={busy !== null}
                loading={busy === "generate"}
                leadingIcon={<FileCheck2 aria-hidden="true" />}
              >
                {busy === "generate" ? "Generating…" : "Generate certificate"}
              </Button>
            )}
          </div>

          <p className="text-xs text-muted">
            The backend requires a score above its CERTIFICATE_PASS_SCORE
            threshold — it will say so if this interview doesn&apos;t qualify.
          </p>
        </div>
      )}
    </Card>
  );
}
