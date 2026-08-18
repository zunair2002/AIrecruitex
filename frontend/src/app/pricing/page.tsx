import { PricingCards } from "@/components/home/PricingCards";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Pricing | AIRecruitX",
  description: "AIRecruitX pricing plans - Free, Pro, and Enterprise",
};

export default function PricingPage() {
  return (
    <main>
      <section className="pt-32 pb-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple plans for candidates and HR teams. Start free and upgrade as you grow.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingCards />
        </div>
      </section>

      <Footer />
    </main>
  );
}
