"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

const benefits = [
  {
    title: "Practice interviews",
    description:
      "Basic and advanced AI interviews to prepare for real job applications.",
  },
  {
    title: "Resume matching",
    description:
      "Upload a PDF resume and get matched to relevant open roles.",
  },
  {
    title: "Scored feedback",
    description:
      "Communication, technical skill, and confidence after every interview.",
  },
  {
    title: "Learning paths",
    description: "Resources suggested from the areas you need to strengthen.",
  },
  {
    title: "Career guidance",
    description: "On-demand advice whenever you need a second opinion.",
  },
  {
    title: "Progress tracking",
    description: "Interview history, average score, and improvement over time.",
  },
];

export const CandidateBenefits = () => (
  <section className="bg-[#f6f3f9] py-24" id="candidate-benefits">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="mb-12 max-w-2xl"
      >
        <p className="eyebrow">For candidates</p>
        <h2 className="font-display mt-5 text-4xl text-ink md:text-5xl">
          Prepared before the first real interview
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[#6b5f7a]">
          Practice, improve, and apply with structured coaching from resume to
          offer.
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
