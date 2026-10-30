"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { pricingPlans } from "./pricingData";
import { fadeUp, stagger } from "@/lib/motion";

export const PricingCards = ({ compact = false }: { compact?: boolean }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={stagger}
    className={`grid grid-cols-1 gap-px bg-[#e0d6ea] ${compact ? "md:grid-cols-3" : "lg:grid-cols-3"}`}
  >
    {pricingPlans.map((plan) => (
      <motion.div
        key={plan.name}
        variants={fadeUp}
        className={`relative flex flex-col p-8 ${
          plan.highlighted
            ? "border-t-4 border-[#d4b8f0] bg-navy text-white"
            : "bg-white text-ink"
        }`}
      >
        {plan.highlighted && (
          <span className="mb-4 text-[11px] font-semibold tracking-[0.16em] text-[#d4b8f0] uppercase">
            Most selected
          </span>
        )}
        <h3 className="font-display text-2xl">{plan.name}</h3>
        <div className="mt-3 mb-4">
          <span className="font-display text-4xl">{plan.price}</span>
          {plan.period && (
            <span
              className={`text-sm ${plan.highlighted ? "text-[#9aa6c2]" : "text-[#6b5f7a]"}`}
            >
              {plan.period}
            </span>
          )}
        </div>
        <p
          className={`mb-6 text-sm leading-relaxed ${
            plan.highlighted ? "text-[#9aa6c2]" : "text-[#6b5f7a]"
          }`}
        >
          {plan.description}
        </p>
        <ul className="mb-8 flex-1 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <span className={plan.highlighted ? "text-[#d4b8f0]" : "text-ink"}>
                —
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <Link
          href={plan.href}
          className={`block px-6 py-3 text-center text-sm font-semibold transition ${
            plan.highlighted
              ? "bg-white text-ink hover:bg-[#f6f3f9]"
              : "bg-navy text-white hover:bg-brand"
          }`}
        >
          {plan.cta}
        </Link>
      </motion.div>
    ))}
  </motion.div>
);
