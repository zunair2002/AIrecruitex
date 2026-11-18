import { PricingTabs } from "@/components/home/PricingCards";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Pricing | AiRecruitex",
  description: "AiRecruitex pricing plans for candidates and for companies / HR teams",
};

export default function PricingPage() {
  return (
    <main>
      <section className="bg-canvas pt-32 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Pricing</p>
          <h1 className="font-display mt-5 max-w-2xl text-5xl text-ink">
            Clear plans for serious hiring.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Plans for candidates preparing for interviews, and for companies hiring at scale.
          </p>
        </div>
      </section>

      <section className="bg-canvas pb-20">
        <div className="mx-auto max-w-7xl border border-line px-0 sm:mx-6 lg:mx-auto">
          <PricingTabs />
        </div>
      </section>

      <Footer />
    </main>
  );
}
