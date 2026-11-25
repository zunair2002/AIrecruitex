"use client";

import Link from "next/link";
import { BrandWordmark } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

/**
 * Full-page takeover shown when the signed-in account has been deactivated by
 * an admin.
 *
 * The backend already refuses every request from a deactivated account (403
 * from `requireAuth`, and `login` won't issue a token either). Without this
 * screen the portal kept rendering from the cached user object and just showed
 * empty panels, which reads as the app being broken rather than the account
 * being switched off.
 */
export function AccountDeactivated({
  onSignOut,
}: {
  /** Clears the dead session so the login page isn't entered with it. */
  onSignOut?: () => void;
}) {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-canvas px-4 py-10 sm:px-6">
      <Link
        href="/"
        onClick={onSignOut}
        className="mb-6 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <BrandWordmark className="text-2xl" />
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-center shadow-xs sm:p-8">
        <DeactivatedIllustration />

        <div className="mt-6">
          <Badge tone="danger" dot>
            Account deactivated
          </Badge>
        </div>

        <h1 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          Your account has been switched off
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          An administrator deactivated this account, so it can&apos;t be used to
          sign in or load your data right now. Nothing has been deleted — your
          applications, resume and interview history are all still there, and
          they come back the moment the account is reactivated.
        </p>

        <div className="mt-7 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <Button href="/contact" onClick={onSignOut} variant="secondary">
            Contact support
          </Button>
          <Button href="/" onClick={onSignOut}>
            Back to homepage
          </Button>
        </div>
      </div>

      <p className="mt-6 max-w-sm text-center text-xs text-muted">
        Think this is a mistake? Reach out and an administrator can turn it back
        on.
      </p>
    </main>
  );
}

/**
 * A switched-off ID badge, asleep on its lanyard — the recruitment equivalent
 * of a dimmed screen. Drawn in the brand purples so it belongs to the same
 * product as the portals, and marked `aria-hidden` because the heading beside
 * it already carries the meaning.
 */
function DeactivatedIllustration() {
  return (
    <svg
      viewBox="0 0 240 180"
      role="img"
      aria-hidden="true"
      className="mx-auto h-auto w-56"
    >
      {/* soft halo */}
      <ellipse cx="120" cy="150" rx="74" ry="11" fill="var(--color-brand-100)" />
      <circle cx="120" cy="84" r="62" fill="var(--color-brand-50)" />

      {/* lanyard */}
      <path
        d="M92 16 L112 44 M148 16 L128 44"
        stroke="var(--color-brand-300)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="110" y="40" width="20" height="9" rx="3" fill="var(--color-brand-500)" />

      {/* badge body */}
      <rect x="66" y="50" width="108" height="78" rx="12" fill="var(--color-surface)" />
      <rect
        x="66"
        y="50"
        width="108"
        height="78"
        rx="12"
        fill="none"
        stroke="var(--color-brand-200)"
        strokeWidth="2.5"
      />
      <rect x="66" y="50" width="108" height="16" rx="12" fill="var(--color-brand-800)" />
      <rect x="66" y="58" width="108" height="8" fill="var(--color-brand-800)" />

      {/* sleeping face */}
      <circle cx="120" cy="88" r="21" fill="var(--color-brand-100)" />
      <path
        d="M110 85 q4.5 -4.5 9 0 M121 85 q4.5 -4.5 9 0"
        stroke="var(--color-brand-800)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M114 98 q6 -4.5 12 0"
        stroke="var(--color-brand-500)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* greyed-out detail lines */}
      <rect x="92" y="114" width="56" height="5" rx="2.5" fill="var(--color-line)" />

      {/* power symbol, unlit */}
      <circle cx="170" cy="118" r="17" fill="var(--color-surface)" stroke="var(--color-brand-200)" strokeWidth="2.5" />
      <path
        d="M170 110 v9"
        stroke="var(--color-subtle)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M163.5 112.5 a9 9 0 1 0 13 0"
        stroke="var(--color-subtle)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* drifting z's */}
      <text x="186" y="52" fill="var(--color-brand-300)" fontSize="17" fontWeight="700">z</text>
      <text x="198" y="36" fill="var(--color-brand-200)" fontSize="13" fontWeight="700">z</text>
      <text x="207" y="24" fill="var(--color-brand-100)" fontSize="10" fontWeight="700">z</text>
    </svg>
  );
}
