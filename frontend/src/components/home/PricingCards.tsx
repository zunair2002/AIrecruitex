"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlanCta } from "./PlanCta";
import { Building2, UserRound } from "lucide-react";
import {
  pricingCategories,
  type PricingCategory,
  type PricingPlan,
} from "./pricingData";
import { fadeUp, stagger } from "@/lib/motion";
import { SegmentedControl } from "@/components/ui/Tabs";

const CATEGORY_ICONS: Record<PricingCategory, React.ReactNode> = {
  candidates: <UserRound aria-hidden="true" />,
  companies: <Building2 aria-hidden="true" />,
};

/**
 * Pricing split by audience: a segmented control switches between candidate
 * plans and company / HR plans, each shown as its own row of tier cards.
 */
export function PricingTabs({ compact = false }: { compact?: boolean }) {
  const [category, setCategory] = useState<PricingCategory>("candidates");
  const active =
    pricingCategories.find((item) => item.id === category) ??
    pricingCategories[0];

  return (
    <div>
      <div className="flex justify-center border-b border-line bg-white px-4 py-5">
        <SegmentedControl
          ariaLabel="Plan audience"
          options={pricingCategories.map((item) => ({
            value: item.id,
            label: item.label,
            icon: CATEGORY_ICONS[item.id],
          }))}
          value={category}
          onChange={setCategory}
        />
      </div>
      {/* Keyed so the cards animate in again when the audience changes. */}
      <PricingCards key={active.id} plans={active.plans} compact={compact} />
    </div>
  );
}

export const PricingCards = ({
  plans,
  compact = false,
}: {
  plans: PricingPlan[];
  compact?: boolean;
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={stagger}
    className={`grid grid-cols-1 gap-px bg-line ${compact ? "md:grid-cols-3" : "lg:grid-cols-3"}`}
  >
    {plans.map((plan) => (
      <motion.div
        key={plan.name}
        variants={fadeUp}
        className={`relative flex flex-col p-8 ${
          plan.highlighted
            ? "border-t-4 border-brand-200 bg-navy text-white"
            : "bg-white text-ink"
        }`}
      >
        {plan.highlighted && (
          <span className="mb-4 text-xs font-semibold tracking-[0.16em] text-brand-200 uppercase">
            Most selected
          </span>
        )}
        <h3 className="font-display text-2xl">{plan.name}</h3>
        <div className="mt-3 mb-4">
          <span className="font-display text-4xl">{plan.price}</span>
          {plan.period && (
            <span
              className={`text-sm ${plan.highlighted ? "text-subtle" : "text-muted"}`}
            >
              {plan.period}
            </span>
          )}
        </div>
        <p
          className={`mb-6 text-sm leading-relaxed ${
            plan.highlighted ? "text-subtle" : "text-muted"
          }`}
        >
          {plan.description}
        </p>
        <ul className="mb-8 flex-1 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <span className={plan.highlighted ? "text-brand-200" : "text-ink"}>
                —
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <PlanCta
          plan={plan}
          className={`block px-6 py-3 text-center text-sm font-semibold transition ${
            plan.highlighted
              ? "bg-white text-ink hover:bg-canvas"
              : "bg-navy text-white hover:bg-brand"
          }`}
        />
      </motion.div>
    ))}
  </motion.div>
);
