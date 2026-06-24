"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { featurePills } from "./scenesData";
import { fadeInUp, staggerContainer } from "./animationVariants";

export const MoreFeaturesSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePillDesc, setActivePillDesc] = useState<number | null>(null);

  return (
    <motion.div variants={fadeInUp} className="more-features-section mt-16">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="more-features-toggle mx-auto flex items-center gap-2 px-6 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-semibold text-indigo-600">
          {isExpanded ? "See less features" : "See more features"}
        </span>
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-4 h-4 text-indigo-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </motion.svg>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isExpanded ? 1 : 0, height: isExpanded ? "auto" : 0 }}
        transition={{ duration: 0.5 }}
        className="more-features-content overflow-hidden"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isExpanded ? "visible" : "hidden"}
          className="feature-pills grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8"
        >
          {featurePills.map((pill, index) => (
            <motion.div key={index} variants={fadeInUp} className="feature-pill-wrapper">
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                className="feature-pill w-full text-left px-4 py-3 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-between"
                onClick={() => setActivePillDesc(activePillDesc === index ? null : index)}
              >
                <span className="flex items-center gap-2">
                  <motion.span animate={{ rotate: activePillDesc === index ? 180 : 0 }} className="text-indigo-500">✦</motion.span>
                  {pill.name}
                </span>
                <motion.svg
                  animate={{ rotate: activePillDesc === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-4 h-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </motion.svg>
              </motion.button>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: activePillDesc === index ? 1 : 0,
                  height: activePillDesc === index ? "auto" : 0,
                  marginTop: activePillDesc === index ? "8px" : "0px",
                }}
                transition={{ duration: 0.3 }}
                className="feature-pill-desc overflow-hidden text-sm text-gray-600 bg-gray-50 rounded-lg px-4"
              >
                {pill.desc}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
