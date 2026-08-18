"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "./animationVariants";
import { usePowerfulFeaturesState } from "./usePowerfulFeaturesState";
import { PowerfulFeaturesHeader } from "./PowerfulFeaturesHeader";
import { FeaturesCarousel } from "./FeaturesCarousel";
import { FeaturesCarouselNav } from "./FeaturesCarouselNav";
import { MoreFeaturesSection } from "./MoreFeaturesSection";

export const PowerfulFeatures = () => {
  const state = usePowerfulFeaturesState();

  return (
    <motion.section
      ref={state.sectionRef}
      initial="hidden"
      animate={state.sectionControls}
      variants={fadeInUp}
      className="features-animated py-20 bg-white overflow-hidden"
      id="features"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="features-collapsible-content">
          <motion.div ref={state.headerRef} initial="hidden" animate={state.headerControls} variants={fadeInUp}>
            <PowerfulFeaturesHeader />
          </motion.div>

          <motion.div ref={state.carouselRef} initial="hidden" animate={state.carouselControls} variants={fadeInUp}>
            <FeaturesCarousel wrapperRef={state.wrapperRef} />
          </motion.div>

          <FeaturesCarouselNav
            activeScene={state.activeScene}
            onPrev={state.prevScene}
            onNext={state.nextScene}
            onGoTo={state.setActiveScene}
          />

          <motion.div ref={state.moreFeaturesRef} initial="hidden" animate={state.moreFeaturesControls} variants={fadeInUp}>
            <MoreFeaturesSection />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
