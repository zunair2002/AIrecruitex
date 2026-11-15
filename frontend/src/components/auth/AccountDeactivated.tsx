"use client";

import Link from "next/link";

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
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#f7f8fa] px-5 py-10">
      <div className="w-full max-w-md text-center">
        <DeactivatedIllustration />

        <p className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-[#f3e8ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4a148c]">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[#9b6fd4]"
          />
          Account deactivated
        </p>

        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#292b35] sm:text-[28px]">
          Your account has been switched off
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-[#686b77]">
          An administrator deactivated this account, so it can&apos;t be used to
          sign in or load your data right now. Nothing has been deleted — your
          applications, resume and interview history are all still there, and
          they come back the moment the account is reactivated.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Link
            href="/"
            onClick={onSignOut}
            className="inline-flex h-10 w-full items-center justify-center rounded bg-[#4a148c] px-5 text-[12px] font-semibold text-white transition-colors hover:bg-[#2e0a5c] sm:w-auto"
          >
            Back to homepage
          </Link>
          <Link
            href="/contact"
            onClick={onSignOut}
            className="inline-flex h-10 w-full items-center justify-center rounded border border-[#e3e4ec] bg-white px-5 text-[12px] font-semibold text-[#44464f] transition-colors hover:bg-[#f3f3f6] sm:w-auto"
          >
            Contact support
          </Link>
        </div>

        <p className="mt-6 text-[11px] text-[#9698a2]">
          Think this is a mistake? Reach out and an administrator can turn it
          back on.
        </p>
      </div>
    </div>
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
      <ellipse cx="120" cy="150" rx="74" ry="11" fill="#ece3f7" />
      <circle cx="120" cy="84" r="62" fill="#f6f1fc" />

      {/* lanyard */}
      <path
        d="M92 16 L112 44 M148 16 L128 44"
        stroke="#c9b3e4"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="110" y="40" width="20" height="9" rx="3" fill="#9b6fd4" />

      {/* badge body */}
      <rect x="66" y="50" width="108" height="78" rx="12" fill="#ffffff" />
      <rect
        x="66"
        y="50"
        width="108"
        height="78"
        rx="12"
        fill="none"
        stroke="#e0d6ea"
        strokeWidth="2.5"
      />
      <rect x="66" y="50" width="108" height="16" rx="12" fill="#4a148c" />
      <rect x="66" y="58" width="108" height="8" fill="#4a148c" />

      {/* sleeping face */}
      <circle cx="120" cy="88" r="21" fill="#f3e8ff" />
      <path
        d="M110 85 q4.5 -4.5 9 0 M121 85 q4.5 -4.5 9 0"
        stroke="#4a148c"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M114 98 q6 -4.5 12 0"
        stroke="#9b6fd4"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* greyed-out detail lines */}
      <rect x="92" y="114" width="56" height="5" rx="2.5" fill="#e6e7ee" />

      {/* power symbol, unlit */}
      <circle cx="170" cy="118" r="17" fill="#ffffff" stroke="#e0d6ea" strokeWidth="2.5" />
      <path
        d="M170 110 v9"
        stroke="#9698a2"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M163.5 112.5 a9 9 0 1 0 13 0"
        stroke="#9698a2"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* drifting z's */}
      <text x="186" y="52" fill="#c9b3e4" fontSize="17" fontWeight="700">z</text>
      <text x="198" y="36" fill="#dccdee" fontSize="13" fontWeight="700">z</text>
      <text x="207" y="24" fill="#e8dff4" fontSize="10" fontWeight="700">z</text>
    </svg>
  );
}
