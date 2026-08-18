import Link from "next/link";
import { pricingPlans } from "./pricingData";

export const PricingCards = ({ compact = false }: { compact?: boolean }) => (
  <div className={`grid grid-cols-1 ${compact ? "md:grid-cols-3" : "lg:grid-cols-3"} gap-8`}>
    {pricingPlans.map((plan) => (
      <div
        key={plan.name}
        className={`rounded-2xl p-8 flex flex-col ${
          plan.highlighted
            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105 border-2 border-indigo-600"
            : "bg-white text-gray-900 border border-gray-200 shadow-sm"
        }`}
      >
        <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-black">{plan.price}</span>
          {plan.period && (
            <span className={`text-sm ${plan.highlighted ? "text-indigo-200" : "text-gray-500"}`}>
              {plan.period}
            </span>
          )}
        </div>
        <p className={`text-sm mb-6 ${plan.highlighted ? "text-indigo-100" : "text-gray-500"}`}>
          {plan.description}
        </p>
        <ul className="space-y-3 mb-8 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <span className={plan.highlighted ? "text-indigo-200" : "text-indigo-600"}>✓</span>
              {feature}
            </li>
          ))}
        </ul>
        <Link
          href={plan.href}
          className={`block text-center py-3 px-6 rounded-xl font-semibold transition-colors ${
            plan.highlighted
              ? "bg-white text-indigo-600 hover:bg-indigo-50"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {plan.cta}
        </Link>
      </div>
    ))}
  </div>
);
