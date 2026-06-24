import { Hero } from "@/components/home/Hero";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CandidateBenefits } from "@/components/home/CandidateBenefits";
import { HRBenefits } from "@/components/home/HRBenefits";
import { WhiteLabel } from "@/components/home/WhiteLabel";
import { PowerfulFeatures } from "@/components/home/PowerfulFeatures";
import { RaaS } from "@/components/home/RaaS";
import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <ProductShowcase />
      <HowItWorks />
      <CandidateBenefits />
      <HRBenefits />
      <WhiteLabel />
      <PowerfulFeatures />
      <RaaS />
      <Contact />
      <Footer />
    </main>
  );
}
