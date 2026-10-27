"use client";

import { motion } from "framer-motion";
import { raasFeatures } from "./raasFeaturesData";
import {
  fadeInUp,
  fadeInLeft,
  staggerContainer,
  scaleUp,
} from "./animationVariants";
import { useRaasAnimations } from "./useRaasAnimations";

export const RaaS = () => {
  const anim = useRaasAnimations();

  return (
    <motion.section
      ref={anim.sectionRef}
      initial="hidden"
      animate={anim.sectionControls}
      variants={fadeInUp}
      className="bg-navy py-24"
      id="recruitment-service"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={anim.contentRef}
          initial="hidden"
          animate={anim.contentControls}
          variants={fadeInUp}
          className="max-w-3xl"
        >
          <motion.p
            variants={fadeInUp}
            className="text-[11px] font-semibold tracking-[0.18em] text-[#d4b8f0] uppercase"
          >
            Recruitment as a service
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="font-display mt-5 text-4xl text-white md:text-5xl"
          >
            Don&apos;t have a recruitment team?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-lg leading-relaxed text-[#9aa6c2]"
          >
            AiRecruitex can also run the first-stage process: post the role,
            screen every applicant, and deliver a scored shortlist of people
            worth meeting.
          </motion.p>
        </motion.div>

        <motion.div
          ref={anim.featuresRef}
          initial="hidden"
          animate={anim.featuresControls}
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 border-t border-white/15 md:grid-cols-2 lg:grid-cols-4"
        >
          {raasFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInLeft}
              className={`border-b border-white/15 py-8 md:px-6 ${
                index === 0 ? "md:pl-0" : ""
              }`}
            >
              <div className="mb-5 text-brand">{feature.icon}</div>
              <span className="text-sm leading-relaxed text-white">
                {feature.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          ref={anim.ctaRef}
          initial="hidden"
          animate={anim.ctaControls}
          variants={scaleUp}
          className="mt-12"
        >
          <a
            href="#contact"
            className="inline-flex items-center bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-[#f6f3f9]"
          >
            Speak with us
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
};
