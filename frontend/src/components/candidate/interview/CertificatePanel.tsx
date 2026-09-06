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
import { Card, InlineError, InlineSuccess } from "@/components/ui/Feedback";
import { primaryButtonClass, secondaryButtonClass } from "@/components/ui/controls";

/**
 * The certificate flow, exactly as the backend gates it:
 *   1. session completed AND score > CERTIFICATE_PASS_SCORE (403 otherwise)
 *   2. POST /checkout  -> Stripe Checkout URL
 *   3. POST /confirm-payment -> flips certificatePayment.paid once Stripe says paid
 *   4. POST /generate  -> renders + uploads the PDF (402 while unpaid)
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
  const [busy, setBusy] = useState<null | "checkout" | "confirm" | "generate">(null);
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
          : "Stripe hasn&apos;t recorded this payment yet. Try again in a moment.",
      );
    });

  const handleGenerate = () =>
    run("generate", async () => {
      setCertificate(await generateCertificate(sessionId, token));
      setNotice("Certificate issued.");
    });

  if (result === "fail") {
    return (
      <Card title="Certificate">
        <p className="text-sm text-gray-600">
          Certificates are issued only for passing interviews. Practice again to
          raise your score, then come back here.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Certificate">
      {certificate ? (
        <div className="space-y-3">
          <InlineSuccess message="Your certificate has been issued." />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Certificate ID
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-gray-900">
                {certificate.certId}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Score on certificate
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {certificate.score}%
              </p>
            </div>
          </div>
          <a
            href={certificate.certificateUrl}
            target="_blank"
            rel="noreferrer"
            className={`${primaryButtonClass} inline-block text-sm`}
          >
            Download certificate PDF
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {isPaid
              ? "Payment received — generate your certificate PDF."
              : "A certificate is available for this interview once payment is complete."}
            {typeof score === "number" && (
              <>
                {" "}
                Your score: <span className="font-semibold">{score}%</span>.
              </>
            )}
          </p>

          {error && <InlineError message={error} />}
          {notice && <InlineSuccess message={notice} />}

          <div className="flex flex-wrap gap-3">
            {!isPaid && (
              <>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={busy !== null}
                  className={`${primaryButtonClass} text-sm`}
                >
                  {busy === "checkout" ? "Opening checkout…" : "Pay for certificate"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={busy !== null}
                  className={`${secondaryButtonClass} text-sm`}
                >
                  {busy === "confirm" ? "Checking…" : "I've already paid"}
                </button>
              </>
            )}
            {isPaid && (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={busy !== null}
                className={`${primaryButtonClass} text-sm`}
              >
                {busy === "generate" ? "Generating…" : "Generate certificate"}
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400">
            The backend requires a score above its CERTIFICATE_PASS_SCORE
            threshold — it will say so if this interview doesn&apos;t qualify.
          </p>
        </div>
      )}
    </Card>
  );
}
