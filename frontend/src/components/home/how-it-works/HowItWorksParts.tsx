import type { HowItWorksStep } from "./stepsData";

export const HowItWorksHeader = () => (
  <div className="mb-12 max-w-2xl">
    <p className="eyebrow">How it works</p>
    <h2 className="font-display mt-5 text-4xl text-ink md:text-5xl">
      From job posting to shortlist in three steps
    </h2>
    <p className="mt-4 text-lg leading-relaxed text-[#6b5f7a]">
      The first stage of hiring, handled overnight — so your team spends time
      only with the right people.
    </p>
  </div>
);

export const StepCard = ({ step }: { step: HowItWorksStep }) => (
  <div className="framed-card h-full p-8">
    <p className="text-[11px] font-bold tracking-[0.16em] text-accent uppercase">
      Step {String(step.number).padStart(2, "0")}
    </p>
    <h3 className="font-display mt-5 text-2xl text-ink">{step.title}</h3>
    <p className="mt-3 text-sm leading-relaxed text-[#6b5f7a]">
      {step.description}
    </p>
  </div>
);
