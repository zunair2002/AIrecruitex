"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "./animationVariants";

export const PowerfulFeaturesHeader = () => (
  <motion.div variants={fadeInUp} className="mb-14 max-w-2xl">
    <motion.p variants={fadeInUp} className="eyebrow">
      Capabilities
    </motion.p>
    <motion.h2
      variants={fadeInUp}
      className="font-display mt-5 text-4xl text-ink md:text-5xl"
    >
      Intelligence at every stage of the funnel
    </motion.h2>
    <motion.p
      variants={fadeInUp}
      className="mt-4 text-lg leading-relaxed text-[#6b5f7a]"
    >
      Autopilot screening, structured scoring, and discrepancy checks that
      surface the candidates your team should meet.
    </motion.p>
  </motion.div>
);
