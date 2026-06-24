"use client";

import { motion } from "framer-motion";
import { powerfulFeaturesScenes } from "./scenesData";
import { fadeInUp } from "./animationVariants";

type FeaturesCarouselNavProps = {
  activeScene: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
};

export const FeaturesCarouselNav = ({
  activeScene,
  onPrev,
  onNext,
  onGoTo,
}: FeaturesCarouselNavProps) => (
  <motion.div variants={fadeInUp} className="features-carousel-nav flex items-center justify-center gap-4 mt-8">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="features-carousel-btn w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
      onClick={onPrev}
      aria-label="Previous feature"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </motion.button>
    <div className="features-carousel-dots flex gap-2">
      {powerfulFeaturesScenes.map((_, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.2 }}
          className={`features-carousel-dot rounded-full transition-all ${
            activeScene === index ? "w-6 bg-indigo-600" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
          }`}
          style={{ height: "8px" }}
          onClick={() => onGoTo(index)}
          aria-label={`Go to feature ${index + 1}`}
        />
      ))}
    </div>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="features-carousel-btn w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
      onClick={onNext}
      aria-label="Next feature"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </motion.button>
  </motion.div>
);
