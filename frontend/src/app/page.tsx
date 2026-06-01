import Navbar from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhiteLabel } from "@/components/home/WhiteLabel";

export default function Home() {
  return (
    <main>
      {/* <Navbar /> */}
      <Hero />
      <ProductShowcase />
      <HowItWorks />
      <WhiteLabel />
    </main>
  );
}
