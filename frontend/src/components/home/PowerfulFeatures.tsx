"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

export const PowerfulFeatures = () => {
  const [activeScene, setActiveScene] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePillDesc, setActivePillDesc] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Refs for scroll animations
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const carouselRef = useRef(null);
  const moreFeaturesRef = useRef(null);
  
  // Check if elements are in view
  const isSectionInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isCarouselInView = useInView(carouselRef, { once: true, amount: 0.3 });
  const isMoreFeaturesInView = useInView(moreFeaturesRef, { once: true, amount: 0.3 });
  
  // Animation controls
  const sectionControls = useAnimation();
  const headerControls = useAnimation();
  const carouselControls = useAnimation();
  const moreFeaturesControls = useAnimation();

  const scenes = [
    {
      id: 0,
      title: "Two-Stage Screening",
      description:
        "Quick CV filter first, deep interviews only for promising candidates. Save credits and time by eliminating poor fits early in the process.",
    },
    {
      id: 1,
      title: "24/7 AI Interviews",
      description:
        "Candidates interview on their schedule — no diary juggling or timezone coordination. Multiple interviews run in parallel, anywhere in the world, 24/7.",
    },
    {
      id: 2,
      title: "Smart Scoring",
      description:
        "Dual-agent AI consensus ensures accurate, unbiased match scores. Two AI reviewers independently evaluate each candidate, then reconcile for fair, reliable rankings.",
    },
    {
      id: 3,
      title: "Discrepancy Detection",
      description:
        "AI flags mismatches between CV claims and interview answers. Catch embellishments automatically before they become costly hiring mistakes.",
    },
  ];

  const featurePills = [
    { name: "Anti-Cheat Protection", desc: "Blocks copy/paste and tracks tab switches during interviews to ensure honest responses." },
    { name: "Optional Timed Questions", desc: "Set time limits per question to keep interviews focused and moving." },
    { name: "Optional Follow-up Questions", desc: "AI automatically probes deeper when candidate answers are vague or incomplete." },
    { name: "White-Label Branding", desc: "Use your own logo, colours, and AI assistant name so candidates see your brand." },
    { name: "CV Parsing", desc: "Automatically extracts skills, experience, and education from uploaded CVs." },
    { name: "Candidate Insights", desc: "AI-generated summary of candidate strengths, weaknesses, and overall fit." },
    { name: "Scoring Breakdown", desc: "See exactly how the match score was calculated across each competency." },
    { name: "Bias-Free Scoring", desc: "Candidates are scored and ranked purely on merit, skills, experience, and cultural fit." },
    { name: "Email Notifications", desc: "Get notified instantly when candidates complete their interviews." },
    { name: "Manual & Auto Top-up", desc: "Add credits manually or set automatic top-up when your balance runs low." },
    { name: "Custom CSV Export", desc: "Export candidate data to CSV with your choice of fields and filters." },
    { name: "Candidate Report PDF", desc: "Download a formatted PDF report for any candidate to share with your team." },
    { name: "Custom Interviewer Name", desc: "Replace the default AI name with your own brand name for a seamless experience." },
    { name: "Deep Analysis", desc: "Premium AI deep-dive analysis using advanced models for detailed candidate evaluation." },
    { name: "Tailored Interview Questions", desc: "AI generates interview questions specific to your job description and requirements." },
    { name: "Candidate Red Flags", desc: "AI highlights potential concerns, inconsistencies, or red flags in candidate responses." },
    { name: "Interview Transcript", desc: "Full conversation record of each AI interview for review and compliance." },
    { name: "GDPR Delete Data Button", desc: "One-click deletion of all candidate data for GDPR compliance requests." },
  ];

  // Trigger animations when elements come into view
  useEffect(() => {
    if (isSectionInView) {
      sectionControls.start("visible");
    }
    if (isHeaderInView) {
      headerControls.start("visible");
    }
    if (isCarouselInView) {
      carouselControls.start("visible");
    }
    if (isMoreFeaturesInView) {
      moreFeaturesControls.start("visible");
    }
  }, [isSectionInView, isHeaderInView, isCarouselInView, isMoreFeaturesInView, sectionControls, headerControls, carouselControls, moreFeaturesControls]);

  const nextScene = () => {
    setActiveScene((prev) => (prev + 1) % scenes.length);
  };

  const prevScene = () => {
    setActiveScene((prev) => (prev - 1 + scenes.length) % scenes.length);
  };

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translateX(-${activeScene * 100}%)`;
    }
  }, [activeScene]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
      className="features-animated py-20 bg-white overflow-hidden"
      id="features-animated"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="features-collapsible-content">
          {/* Section Header with Animation */}
          <motion.div
            ref={headerRef}
            initial="hidden"
            animate={headerControls}
            variants={fadeInUp}
            className="section-header text-center mb-16"
          >
            <motion.p
              variants={fadeInUp}
              className="carousel-headline-small"
              style={{
                color: "#1F2937",
                fontSize: "24px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                margin: "0px 0px 8px",
                fontWeight: "400",
              }}
            >
              <span className="hw" style={{ fontWeight: "600" }}>
                Powerful
              </span>{" "}
              Features
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="carousel-headline"
              style={{
                color: "#1F2937",
                fontSize: "40px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              Everything you need to screen candidates efficiently.
            </motion.h2>
          </motion.div>

          {/* Features Carousel with Animation */}
          <motion.div
            ref={carouselRef}
            initial="hidden"
            animate={carouselControls}
            variants={staggerContainer}
            className="features-carousel overflow-hidden"
          >
            <motion.div
              variants={scaleUp}
              ref={wrapperRef}
              className="features-scenes-wrapper flex transition-transform duration-500 ease-out"
              style={{ transform: "translateX(0px)" }}
            >
              {scenes.map((scene, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="feature-scene flex-shrink-0 w-full px-4"
                  data-scene={scene.id}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="scene-visual mb-8"
                  >
                    {/* Two-Stage Screening Visual */}
                    {scene.id === 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="scene-twostage bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8"
                      >
                        <div className="pipeline flex items-center justify-center gap-4 flex-wrap">
                          <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="pipeline-stage text-center"
                          >
                            <div className="cv-pile">
                              <motion.div
                                whileHover={{ y: -5 }}
                                className="cv-doc w-12 h-16 bg-indigo-200 rounded mb-1"
                              ></motion.div>
                              <motion.div
                                whileHover={{ y: -5 }}
                                className="cv-doc w-12 h-16 bg-indigo-200 rounded mb-1"
                              ></motion.div>
                              <motion.div
                                whileHover={{ y: -5 }}
                                className="cv-doc w-12 h-16 bg-indigo-200 rounded"
                              ></motion.div>
                            </div>
                            <div className="pile-label font-bold mt-2">50 CVs</div>
                            <div className="pile-count text-sm text-gray-500">received</div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="filter-line text-4xl text-indigo-400"
                          >
                            →
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="pipeline-stage text-center"
                          >
                            <div className="filter-gate">
                              <div className="filter-icon text-indigo-600 text-3xl">⚡</div>
                              <div className="filter-label font-bold">CV Screen</div>
                              <div className="filter-stats text-indigo-600">8 pass</div>
                            </div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="filter-line text-4xl text-indigo-400"
                          >
                            →
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.0 }}
                            className="pipeline-stage text-center"
                          >
                            <div className="interview-stage">
                              <div className="interview-box bg-indigo-100 p-4 rounded-lg">
                                <div className="chat-lines">
                                  <motion.div
                                    animate={{ width: ["20px", "80px", "20px"] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="chat-line-mini ai h-2 bg-indigo-300 rounded mb-1"
                                  ></motion.div>
                                  <div className="chat-line-mini user h-2 w-16 bg-gray-300 rounded mb-1"></div>
                                  <div className="chat-line-mini ai h-2 w-24 bg-indigo-300 rounded"></div>
                                </div>
                              </div>
                              <div className="interview-label font-bold mt-2">Interview</div>
                              <div className="interview-count">8 candidates</div>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {/* 24/7 AI Interviews Visual */}
                    {scene.id === 1 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="scene-247 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8"
                      >
                        <div className="global-interviews flex items-center justify-center gap-8 flex-wrap">
                          <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -5 }}
                            className="device-card bg-white p-4 rounded-xl shadow-md"
                          >
                            <div className="device-header flex justify-between mb-2">
                              <span className="device-time font-bold">9:42 AM</span>
                              <div className="device-status w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="device-chat">
                              <motion.div
                                animate={{ width: ["60px", "100px", "60px"] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="chat-line ai h-2 bg-indigo-300 rounded mb-1"
                              ></motion.div>
                              <div className="chat-line user h-2 w-20 bg-gray-300 rounded mb-1"></div>
                              <div className="chat-line ai h-2 w-28 bg-indigo-300 rounded"></div>
                            </div>
                            <div className="device-location text-sm text-gray-500 mt-2">London</div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="always-on-hub text-center"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                              className="clock-ring w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center"
                            >
                              <div className="clock-face text-indigo-600 font-bold">24/7</div>
                            </motion.div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ y: -5 }}
                            className="device-card bg-white p-4 rounded-xl shadow-md"
                          >
                            <div className="device-header flex justify-between mb-2">
                              <span className="device-time font-bold">7:42 PM</span>
                              <div className="device-status w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="device-chat">
                              <div className="chat-line ai h-2 w-24 bg-indigo-300 rounded mb-1"></div>
                              <div className="chat-line user h-2 w-20 bg-gray-300 rounded mb-1"></div>
                              <motion.div
                                animate={{ width: ["60px", "100px", "60px"] }}
                                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                                className="chat-line ai h-2 bg-indigo-300 rounded"
                              ></motion.div>
                            </div>
                            <div className="device-location text-sm text-gray-500 mt-2">New York</div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {/* Smart Scoring Visual */}
                    {scene.id === 2 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="scene-scoring bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8"
                      >
                        <div className="scoring-pipeline flex items-center justify-center gap-6 flex-wrap">
                          <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="interview-doc text-center"
                          >
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="doc-icon bg-indigo-100 p-4 rounded-lg"
                            >
                              <div className="doc-line-sm w-16 h-1 bg-indigo-300 mb-1"></div>
                              <div className="doc-line-sm w-16 h-1 bg-indigo-300 mb-1"></div>
                              <div className="doc-line-sm w-12 h-1 bg-indigo-300"></div>
                            </motion.div>
                            <div className="doc-label mt-2 font-bold">Interview</div>
                          </motion.div>
                          <div className="ai-agents flex items-center gap-4">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              whileHover={{ scale: 1.05 }}
                              className="ai-agent text-center"
                            >
                              <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="ai-agent-icon text-4xl"
                              >
                                🤖
                              </motion.div>
                              <div className="ai-agent-score">
                                <div className="ai-agent-label">Agent 1</div>
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: "84%" }}
                                  transition={{ delay: 0.8, duration: 1 }}
                                  className="ai-agent-value text-2xl font-bold text-indigo-600"
                                >
                                  84%
                                </motion.div>
                              </div>
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                              whileHover={{ scale: 1.05 }}
                              className="ai-agent text-center"
                            >
                              <motion.div
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="ai-agent-icon text-4xl"
                              >
                                🤖
                              </motion.div>
                              <div className="ai-agent-score">
                                <div className="ai-agent-label">Agent 2</div>
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: "88%" }}
                                  transition={{ delay: 1.0, duration: 1 }}
                                  className="ai-agent-value text-2xl font-bold text-purple-600"
                                >
                                  88%
                                </motion.div>
                              </div>
                            </motion.div>
                          </div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8, type: "spring" }}
                            className="final-score text-center"
                          >
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="score-box bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl"
                            >
                              <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="score-box-number text-3xl font-bold"
                              >
                                86
                              </motion.div>
                              <div className="score-box-percent text-sm">Match Score</div>
                            </motion.div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {/* Discrepancy Detection Visual */}
                    {scene.id === 3 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="scene-discrepancy bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8"
                      >
                        <div className="flex items-center justify-center gap-8 flex-wrap">
                          <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.02 }}
                            className="doc-panel cv-panel bg-white p-4 rounded-xl"
                          >
                            <div className="doc-header font-bold mb-2">CV Claims</div>
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              className="doc-line text-green-500"
                            >
                              ✓ Experience: 5 years
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className="doc-line text-green-500"
                            >
                              ✓ Skills: React, Node
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                              className="doc-line text-yellow-500"
                            >
                              ⚠️ Education: Bachelor's
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 }}
                              className="doc-line text-green-500"
                            >
                              ✓ Portfolio available
                            </motion.div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                            className="alert-badge text-yellow-500 text-4xl"
                          >
                            ⚠️
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            whileHover={{ scale: 1.02 }}
                            className="doc-panel interview-panel bg-white p-4 rounded-xl"
                          >
                            <div className="doc-header font-bold mb-2">Interview</div>
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.8 }}
                              className="doc-line text-green-500"
                            >
                              ✓ Experience: 5 years
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.9 }}
                              className="doc-line text-yellow-500"
                            >
                              ⚠️ Skills: React, Angular
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.0 }}
                              className="doc-line text-green-500"
                            >
                              ✓ Portfolio mentioned
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.1 }}
                              className="doc-line text-yellow-500"
                            >
                              ⚠️ Education not mentioned
                            </motion.div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                  <motion.div
                    variants={fadeInUp}
                    className="scene-content text-center max-w-2xl mx-auto"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      <span className="feature-tick inline-block mr-2 text-indigo-600">✓</span>
                      {scene.title}
                    </h3>
                    <p className="text-gray-600">{scene.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Carousel Navigation with Animation */}
          <motion.div
            variants={fadeInUp}
            className="features-carousel-nav flex items-center justify-center gap-4 mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="features-carousel-btn w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              onClick={prevScene}
              aria-label="Previous feature"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </motion.button>
            <div className="features-carousel-dots flex gap-2">
              {scenes.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  className={`features-carousel-dot rounded-full transition-all ${
                    activeScene === index
                      ? "w-6 bg-indigo-600"
                      : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  style={{ height: "8px" }}
                  onClick={() => setActiveScene(index)}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="features-carousel-btn w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              onClick={nextScene}
              aria-label="Next feature"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </motion.button>
          </motion.div>

          {/* More Features Collapsible with Animation */}
          <motion.div
            ref={moreFeaturesRef}
            initial="hidden"
            animate={moreFeaturesControls}
            variants={fadeInUp}
            className="more-features-section mt-16"
          >
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
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="feature-pill-wrapper"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="feature-pill w-full text-left px-4 py-3 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-between"
                      onClick={() =>
                        setActivePillDesc(activePillDesc === index ? null : index)
                      }
                    >
                      <span className="flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: activePillDesc === index ? 180 : 0 }}
                          className="text-indigo-500"
                        >
                          ✦
                        </motion.span>
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
                        marginTop: activePillDesc === index ? "8px" : "0px"
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
        </div>
      </div>
    </motion.section>
  );
};