"use client";

import Link from "next/link";
import { useAuth, homePathForRole } from "@/context/AuthContext";
import { loginHref } from "@/lib/nextPath";
import type { PricingPlan } from "./pricingData";

/**
 * The call-to-action on a pricing card, resolved against the session.
 *
 * The hrefs in pricingData are written for a signed-out visitor. Used as-is
 * they send *everyone* to a login screen — so a candidate who is already
 * signed in and clicks "Get Premium" is bounced to sign-in instead of reaching
 * the upgrade page. This picks the destination from who is actually signed in:
 *
 *  - signed out            → the login screen, carrying ?next= so they land on
 *                            the plan page after signing in instead of a
 *                            dashboard with no memory of what they clicked
 *  - signed in, right role → straight to the plan's page
 *  - signed in, other role → that role's own home (an HR user has no candidate
 *                            billing page, and the portal guard would bounce
 *                            them anyway)
 */
export function PlanCta({
  plan,
  className,
}: {
  plan: PricingPlan;
  className: string;
}) {
  const { user, isLoading } = useAuth();

  const href = resolvePlanHref(plan, user?.role ?? null);

  return (
    <Link
      href={href}
      // Avoid a flash of the signed-out destination while the session is still
      // being restored; the link is inert for that moment rather than wrong.
      aria-disabled={isLoading || undefined}
      className={className}
    >
      {plan.cta}
    </Link>
  );
}

/** Exported for testing the routing rules without rendering. */
export function resolvePlanHref(
  plan: PricingPlan,
  role: "candidate" | "hr" | "admin" | null,
): string {
  // Plans that aren't a purchase (Free, Contact Sales) keep their own href for
  // visitors, and send a signed-in user somewhere useful instead of to login.
  const isLoginLink = plan.href.startsWith("/login");

  if (!role) {
    return isLoginLink ? plan.href : loginHref("/login/candidate", plan.href);
  }

  if (plan.paid) {
    // Only candidates have a billing page today.
    return role === "candidate" ? plan.href : homePathForRole(role);
  }

  return isLoginLink ? homePathForRole(role) : plan.href;
}
