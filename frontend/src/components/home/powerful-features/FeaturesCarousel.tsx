"use client";

import { motion } from "framer-motion";
import { powerfulFeaturesScenes } from "./scenesData";
import { fadeInUp, scaleUp, staggerContainer } from "./animationVariants";
import { SceneVisual } from "./SceneVisual";

type FeaturesCarouselProps = {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
};

export const FeaturesCarousel = ({ wrapperRef }: FeaturesCarouselProps) => (
  <motion.div
    variants={staggerContainer}
    className="features-carousel overflow-hidden"
  >
    <motion.div
      variants={scaleUp}
      ref={wrapperRef}
      className="features-scenes-wrapper flex transition-transform duration-500 ease-out"
      style={{ transform: "translateX(0px)" }}
    >
      {powerfulFeaturesScenes.map((scene, index) => (
        <motion.div
          key={index}
          variants={fadeInUp}
          className="feature-scene flex-shrink-0 w-full px-4"
          data-scene={scene.id}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="framed-card mb-8 overflow-hidden"
          >
            <SceneVisual sceneId={scene.id} />
          </motion.div>
          <motion.div
            variants={fadeInUp}
            className="scene-content text-center max-w-2xl mx-auto"
          >
            <h3 className="font-display mb-3 text-2xl text-ink">
              <span className="feature-tick inline-block mr-2 text-brand">
                ✓
              </span>
              {scene.title}
            </h3>
            <p className="text-[#6b5f7a]">{scene.description}</p>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);
