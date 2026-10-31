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
  <motion.div
    variants={fadeInUp}
    className="mt-8 flex items-center justify-center gap-4"
  >
    <button className="carousel-btn" onClick={onPrev} aria-label="Previous feature">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" strokeWidth="2" />
      </svg>
    </button>
    <div className="flex items-center gap-2">
      {powerfulFeaturesScenes.map((_, index) => (
        <button
          key={index}
          className={`carousel-dot ${activeScene === index ? "is-active" : ""}`}
          onClick={() => onGoTo(index)}
          aria-label={`Go to feature ${index + 1}`}
        />
      ))}
    </div>
    <button className="carousel-btn" onClick={onNext} aria-label="Next feature">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polyline points="9 18 15 12 9 6" strokeWidth="2" />
      </svg>
    </button>
  </motion.div>
);
