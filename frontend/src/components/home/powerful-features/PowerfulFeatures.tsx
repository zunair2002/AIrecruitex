"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "./animationVariants";
import { usePowerfulFeaturesState } from "./usePowerfulFeaturesState";
import { PowerfulFeaturesHeader } from "./PowerfulFeaturesHeader";
import { FeaturesCarousel } from "./FeaturesCarousel";
import { FeaturesCarouselNav } from "./FeaturesCarouselNav";
import { MoreFeaturesSection } from "./MoreFeaturesSection";

export const PowerfulFeatures = () => {
  const {
    sectionRef,
    sectionControls,
    headerRef,
    headerControls,
    carouselRef,
    carouselControls,
    wrapperRef,
    activeScene,
    prevScene,
    nextScene,
    setActiveScene,
    moreFeaturesRef,
    moreFeaturesControls,
  } = usePowerfulFeaturesState();

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate={sectionControls}
      variants={fadeInUp}
      className="features-animated py-20 bg-white overflow-hidden"
      id="features"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="features-collapsible-content">
          <motion.div ref={headerRef} initial="hidden" animate={headerControls} variants={fadeInUp}>
            <PowerfulFeaturesHeader />
          </motion.div>

          <motion.div ref={carouselRef} initial="hidden" animate={carouselControls} variants={fadeInUp}>
            <FeaturesCarousel wrapperRef={wrapperRef} />
          </motion.div>

          <FeaturesCarouselNav
            activeScene={activeScene}
            onPrev={prevScene}
            onNext={nextScene}
            onGoTo={setActiveScene}
          />

          <motion.div ref={moreFeaturesRef} initial="hidden" animate={moreFeaturesControls} variants={fadeInUp}>
            <MoreFeaturesSection />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
