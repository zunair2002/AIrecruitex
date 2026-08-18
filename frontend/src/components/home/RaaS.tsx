"use client";

import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

export const RaaS = () => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  
  const isSectionInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const isContentInView = useInView(contentRef, { once: true, amount: 0.3 });
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.3 });
  const isCtaInView = useInView(ctaRef, { once: true, amount: 0.5 });
  
  const sectionControls = useAnimation();
  const contentControls = useAnimation();
  const featuresControls = useAnimation();
  const ctaControls = useAnimation();

  const raasFeatures = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      ),
      text: "We write and post the job listing"
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      text: "AI screens and interviews every applicant"
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
      ),
      text: "You get a ranked shortlist with scores"
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      text: "You only meet the people worth meeting"
    }
  ];

  useEffect(() => {
    if (isSectionInView) {
      sectionControls.start("visible");
    }
    if (isContentInView) {
      contentControls.start("visible");
    }
    if (isFeaturesInView) {
      featuresControls.start("visible");
    }
    if (isCtaInView) {
      ctaControls.start("visible");
    }
  }, [isSectionInView, isContentInView, isFeaturesInView, isCtaInView, sectionControls, contentControls, featuresControls, ctaControls]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate={sectionControls}
      variants={fadeInUp}
      className="raas-section py-20 bg-gradient-to-br from-indigo-900 to-purple-900"
      id="recruitment-service"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={contentRef}
          initial="hidden"
          animate={contentControls}
          variants={fadeInUp}
          className="raas-content text-center"
        >
          {/* Section Header */}
          <motion.p
            variants={fadeInUp}
            className="carousel-headline-small"
            style={{
              color: "#FFFFFF",
              fontSize: "24px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              margin: "0px 0px 8px",
              fontWeight: "400",
            }}
          >
            <span className="hw" style={{ fontWeight: "600" }}>We'll</span> Handle It
          </motion.p>
          
          <motion.h2
            variants={fadeInUp}
            style={{
              color: "#FFFFFF",
              fontSize: "40px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: "bold",
              margin: "0px 0px 16px",
            }}
          >
            Don't have a recruitment team?
          </motion.h2>
          
          <motion.p
            variants={fadeInUp}
            className="raas-subtitle mx-auto"
            style={{
              color: "#FFFFFFCC",
              fontSize: "18px",
              fontFamily: "'Inter', sans-serif",
              maxWidth: "700px",
              margin: "0 auto 48px auto",
              lineHeight: "1.6",
            }}
          >
            Skreena isn't just software — we also run the entire first-stage process for you. 
            We post the role, screen every applicant with AI interviews, and deliver a scored 
            shortlist of candidates actually worth meeting.
          </motion.p>

          {/* Features Grid */}
          <motion.div
            ref={featuresRef}
            initial="hidden"
            animate={featuresControls}
            variants={staggerContainer}
            className="raas-features grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {raasFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInLeft}
                whileHover={{ scale: 1.05, y: -5 }}
                className="raas-feature bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="raas-feature-icon w-12 h-12 mx-auto mb-4 text-indigo-300"
                >
                  {feature.icon}
                </motion.div>
                <span className="text-white font-medium text-sm sm:text-base">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            ref={ctaRef}
            initial="hidden"
            animate={ctaControls}
            variants={scaleUp}
            className="raas-cta"
          >
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#contact"
              className="btn btn-primary btn-large inline-block px-8 py-4 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{
                fontSize: "18px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Get in Touch
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};