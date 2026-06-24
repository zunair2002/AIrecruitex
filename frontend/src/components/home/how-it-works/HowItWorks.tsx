"use client";

import { howItWorksSteps } from "./stepsData";
import { HowItWorksHeader, StepCard } from "./HowItWorksParts";

export const HowItWorks = () => (
  <section className="how-it-works py-20 bg-gray-50" id="how-it-works">
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <HowItWorksHeader />
      <div className="steps grid grid-cols-1 md:grid-cols-3 gap-8">
        {howItWorksSteps.map((step) => (
          <StepCard key={step.number} step={step} />
        ))}
      </div>
    </div>
  </section>
);
