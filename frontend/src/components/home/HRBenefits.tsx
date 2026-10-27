"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

const benefits = [
  {
    title: "Role intake",
    description:
      "Post jobs with title, description, required skills, and experience.",
  },
  {
    title: "Resume matching",
    description:
      "Every application scored against the role — without a manual sift.",
  },
  {
    title: "AI interviews",
    description:
      "Technical and HR interviews run around the clock, on your criteria.",
  },
  {
    title: "Interview reports",
    description:
      "Confidence, communication, and technical scores in one briefing.",
  },
  {
    title: "Shortlists",
    description: "Select the candidates who clear your bar, in one view.",
  },
  {
    title: "Hiring dashboard",
    description: "Open roles, pipeline, and selected candidates in one place.",
  },
];

export const HRBenefits = () => (
  <section className="bg-white py-24" id="hr-benefits">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="mb-12 max-w-2xl"
      >
        <p className="eyebrow">For hiring teams</p>
        <h2 className="font-display mt-5 text-4xl text-ink md:text-5xl">
          Hire with a brief, not a pile of CVs
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[#6b5f7a]">
          Screening, interviews, and ranked shortlists — so the team meets only
          the strongest fits.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {benefits.map((item, index) => (
          <motion.div
            key={item.title}
            variants={fadeUp}
            className="framed-card p-7"
          >
            <p className="text-[11px] font-bold tracking-[0.16em] text-accent uppercase">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="font-display mt-4 text-xl text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5f7a]">
              {item.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);
