import Link from "next/link";
import { BrandWordmark } from "@/components/layout/Logo";

/**
 * Shown for any URL that doesn't match a route — replaces Next.js's bare
 * black-and-white "404 This page could not be found" screen.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8fb] px-4">
      <div className="w-full max-w-md rounded border border-[#f1f1f5] bg-white p-8 text-center ">
        <div className="mb-6 flex justify-center">
          <BrandWordmark className="text-[1.5rem]" />
        </div>
        <p className="text-5xl font-bold text-brand">404</p>
        <h1 className="mt-4 text-xl font-bold text-[#292b35]">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-2 text-sm text-[#898b96]">
          The link may be out of date, or the page may have moved.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Go to homepage
          </Link>
          <Link
            href="/login/candidate"
            className="rounded border border-[#e9eaf0] bg-white px-6 py-3 text-sm font-semibold text-[#44464f] transition-colors hover:bg-[#f8f8fb]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
