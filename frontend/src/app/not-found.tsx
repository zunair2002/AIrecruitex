import Link from "next/link";
import { LogoMark } from "@/components/layout/Logo";

/**
 * Shown for any URL that doesn't match a route — replaces Next.js's bare
 * black-and-white "404 This page could not be found" screen.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center ">
        <div className="mb-6 flex items-center justify-center gap-2">
          <LogoMark className="h-9 w-9" rounded="rounded-lg" />
          <span className="text-xl font-bold text-gray-900">AiRecruitex</span>
        </div>
        <p className="text-5xl font-bold text-brand">404</p>
        <h1 className="mt-4 text-xl font-bold text-gray-900">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          The link may be out of date, or the page may have moved.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Go to homepage
          </Link>
          <Link
            href="/login/candidate"
            className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
