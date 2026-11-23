"use client";

import type { ReactNode } from "react";
import { ServerOff } from "lucide-react";
import { apiErrorStatus } from "@/lib/api";

/**
 * Shown when a screen's endpoints aren't on the server it is talking to.
 *
 * A 404 from the API is not the same class of problem as a request that
 * failed: it means this build of the frontend is ahead of this backend. The
 * generic error block would show the raw "Route not found: GET /api/..." three
 * times over, which reads as a broken page rather than a feature that hasn't
 * shipped yet.
 */
export function FeatureUnavailable({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 border border-dashed border-[#e3e4ec] bg-white p-5"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f3f3f6] text-[#898b96]">
        <ServerOff aria-hidden="true" className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-[#292b35]">{title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#686b77]">
          {description}
        </p>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

/**
 * True when an error means "this server has no such route", so the caller can
 * show {@link FeatureUnavailable} instead of a failure.
 *
 * Matches on the backend's own wording as well as the status, because its
 * notFoundHandler answers `{ success: false, message: "Route not found: ..." }`
 * — which `apiRequest` turns into an ApiError carrying that message.
 */
export function isEndpointMissing(error: string | null | unknown): boolean {
  if (typeof error === "string") return /route not found/i.test(error);
  if (!error) return false;
  if (apiErrorStatus(error) === 404) return true;
  return error instanceof Error && /route not found/i.test(error.message);
}
