import Link from "next/link";
import { Check, Crown, Sparkles } from "lucide-react";
import type { UserPlan } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { candidatePlans } from "@/components/home/pricingData";

/** Older accounts have no `plan`; they are on the free plan. */
export const planOf = (user: { plan?: UserPlan } | null | undefined): UserPlan =>
  user?.plan === "premium" ? "premium" : "free";

/** Small "Free plan" / "Premium" pill. */
export function PlanBadge({ plan }: { plan: UserPlan }) {
  return plan === "premium" ? (
    <Badge tone="brand" icon={<Crown aria-hidden="true" />}>
      Premium
    </Badge>
  ) : (
    <Badge tone="neutral">Free plan</Badge>
  );
}

export function UpgradeLink({
  label = "Upgrade to Premium",
  size = "sm",
  className = "",
}: {
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <Link href="/pricing" className={buttonClass({ variant: "primary", size, className })}>
      <Crown aria-hidden="true" />
      {label}
    </Link>
  );
}

const featuresOf = (name: string) =>
  candidatePlans.find((plan) => plan.name === name)?.features.slice(0, 4) ?? [];

/**
 * Plan comparison shown at the top of candidate pages that the plan gates.
 * The perks come straight from the pricing page so the two never disagree.
 */
export function PlanBanner({ plan }: { plan: UserPlan }) {
  if (plan === "premium") {
    return (
      <section className="flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 sm:flex-row sm:items-center sm:p-5">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white"
        >
          <Crown className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">You&apos;re on Premium</p>
          <p className="text-sm text-body">
            Every course is unlocked, including Premium ones, and you get 10 practice
            interviews a day.
          </p>
        </div>
      </section>
    );
  }

  const premium = candidatePlans.find((p) => p.name === "Premium");
  return (
    <section
      aria-label="Your plan"
      className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs"
    >
      <div className="grid gap-0 md:grid-cols-[1fr_1fr_auto]">
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-ink">Free</p>
            <Badge tone="neutral">Your plan</Badge>
          </div>
          <PerkList items={featuresOf("Free")} tone="muted" />
        </div>
        <div className="border-t border-line-soft bg-brand-50/60 p-4 sm:p-5 md:border-l md:border-t-0">
          <div className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-brand-600" />
            <p className="text-sm font-semibold text-ink">Premium</p>
            {premium && (
              <span className="text-xs text-muted">
                {premium.price}
                {premium.period}
              </span>
            )}
          </div>
          <PerkList items={featuresOf("Premium")} tone="brand" />
        </div>
        <div className="flex items-center border-t border-line-soft p-4 sm:p-5 md:border-l md:border-t-0">
          <UpgradeLink size="md" className="w-full md:w-auto" />
        </div>
      </div>
    </section>
  );
}

function PerkList({ items, tone }: { items: string[]; tone: "muted" | "brand" }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-body">
          <Check
            aria-hidden="true"
            className={`mt-0.5 h-4 w-4 shrink-0 ${tone === "brand" ? "text-brand-600" : "text-subtle"}`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
