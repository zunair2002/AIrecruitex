"use client";

import { motion } from "framer-motion";
import { howItWorksSteps } from "./stepsData";
import { HowItWorksHeader, StepCard } from "./HowItWorksParts";
import { fadeUp, stagger } from "@/lib/motion";

export const HowItWorks = () => (
  <section className="bg-[#f6f3f9] py-24" id="how-it-works">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        variants={fadeUp}
      >
        <HowItWorksHeader />
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        {howItWorksSteps.map((step) => (
          <motion.div key={step.number} variants={fadeUp}>
            <StepCard step={step} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);
