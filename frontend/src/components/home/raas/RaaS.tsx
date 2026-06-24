"use client";

import { motion } from "framer-motion";
import { raasFeatures } from "./raasFeaturesData";
import { fadeInUp, fadeInLeft, staggerContainer, scaleUp } from "./animationVariants";
import { useRaasAnimations } from "./useRaasAnimations";

export const RaaS = () => {
  const anim = useRaasAnimations();

  return (
    <motion.section
      ref={anim.sectionRef}
      initial="hidden"
      animate={anim.sectionControls}
      variants={fadeInUp}
      className="raas-section py-20 bg-gradient-to-br from-indigo-900 to-purple-900"
      id="recruitment-service"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div ref={anim.contentRef} initial="hidden" animate={anim.contentControls} variants={fadeInUp} className="raas-content text-center">
          <motion.p variants={fadeInUp} className="carousel-headline-small" style={{ color: "#FFFFFF", fontSize: "24px", fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "0px 0px 8px", fontWeight: "400" }}>
            <span className="hw" style={{ fontWeight: "600" }}>We&apos;ll</span> Handle It
          </motion.p>
          <motion.h2 variants={fadeInUp} style={{ color: "#FFFFFF", fontSize: "40px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "bold", margin: "0px 0px 16px" }}>
            Don&apos;t have a recruitment team?
          </motion.h2>
          <motion.p variants={fadeInUp} className="raas-subtitle mx-auto" style={{ color: "#FFFFFFCC", fontSize: "18px", fontFamily: "'Inter', sans-serif", maxWidth: "700px", margin: "0 auto 48px auto", lineHeight: "1.6" }}>
            Skreena isn&apos;t just software — we also run the entire first-stage process for you.
            We post the role, screen every applicant with AI interviews, and deliver a scored
            shortlist of candidates actually worth meeting.
          </motion.p>

          <motion.div ref={anim.featuresRef} initial="hidden" animate={anim.featuresControls} variants={staggerContainer} className="raas-features grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {raasFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeInLeft} whileHover={{ scale: 1.05, y: -5 }} className="raas-feature bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-all duration-300">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className="raas-feature-icon w-12 h-12 mx-auto mb-4 text-indigo-300">
                  {feature.icon}
                </motion.div>
                <span className="text-white font-medium text-sm sm:text-base">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div ref={anim.ctaRef} initial="hidden" animate={anim.ctaControls} variants={scaleUp} className="raas-cta">
            <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#contact" className="btn btn-primary btn-large inline-block px-8 py-4 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl" style={{ fontSize: "18px", fontFamily: "'Inter', sans-serif" }}>
              Get in Touch
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};
