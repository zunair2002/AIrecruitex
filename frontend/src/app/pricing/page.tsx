import { PricingCards } from "@/components/home/PricingCards";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Pricing | AiRecruitex",
  description: "AiRecruitex pricing plans - Free, Pro, and Enterprise",
};

export default function PricingPage() {
  return (
    <main>
      <section className="bg-[#f6f3f9] pt-32 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Pricing</p>
          <h1 className="font-display mt-5 max-w-2xl text-5xl text-ink">
            Clear plans for serious hiring.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[#6b5f7a]">
            Start free. Upgrade when the pipeline grows.
          </p>
        </div>
      </section>

      <section className="bg-[#f6f3f9] pb-20">
        <div className="mx-auto max-w-7xl border border-[#e0d6ea] px-0 sm:mx-6 lg:mx-auto">
          <PricingCards />
        </div>
      </section>

      <Footer />
    </main>
  );
}
