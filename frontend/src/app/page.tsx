import Navbar from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhiteLabel } from "@/components/home/WhiteLabel";
import { FeaturesAnimated } from "@/components/home/FeaturesAnimated";
import { PowerfulFeatures } from "@/components/home/PowerfulFeatures";
import { RaaS } from "@/components/home/RaaS";
import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      {/* <Navbar /> */}
      <Hero />
      <ProductShowcase />
      <HowItWorks />
      <WhiteLabel />
      {/* <FeaturesAnimated /> */}
      <PowerfulFeatures/>
      <RaaS/>
      <Contact/>
      <Footer/>
    </main>
  );
}
