"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/layout/Logo";

/**
 * Catches any runtime error thrown while rendering a route, so a bug shows a
 * recoverable screen instead of a stack trace. `reset()` re-renders the failed
 * segment, which is usually enough when the cause was a transient fetch.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the detail in the console for developers; never on screen.
    console.error("[route error]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center ">
        <div className="mb-6 flex items-center justify-center gap-2">
          <LogoMark className="h-9 w-9" rounded="rounded-lg" />
          <span className="text-xl font-bold text-gray-900">AiRecruitex</span>
        </div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl">
          !
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          Something went wrong on this page
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          This is usually temporary. Try again, and if it keeps happening go
          back to your dashboard.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
