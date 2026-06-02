"use client";

import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

export const Footer = () => {
  const footerRef = useRef(null);
  const isFooterInView = useInView(footerRef, { once: true, amount: 0.2 });
  const footerControls = useAnimation();

  useEffect(() => {
    if (isFooterInView) {
      footerControls.start("visible");
    }
  }, [isFooterInView, footerControls]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const footerLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Services", href: "#recruitment-service" },
    { name: "Contact", href: "#contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "AI Policy", href: "/ai-policy" },
  ];

  return (
    <motion.footer
      ref={footerRef}
      initial="hidden"
      animate={footerControls}
      variants={fadeInUp}
      className="footer bg-gray-900 py-6"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="footer-content flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo Section - Left */}
          <motion.div
            variants={fadeInUp}
            className="footer-logo flex items-center gap-2"
          >
            <div className="footer-logo-icon">
              <svg viewBox="0 0 48 48" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                    <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                  </linearGradient>
                </defs>
                <rect width="48" height="48" rx="12" fill="url(#footerLogoGradient)" />
                <path d="M30 12C30 12 18 12 18 20C18 24 24 24 24 24C24 24 30 24 30 28C30 36 18 36 18 36" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <span className="footer-logo-text text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Skreena
            </span>
          </motion.div>

          {/* Links Section - Right next to logo */}
          <motion.div
            variants={fadeInUp}
            className="footer-links flex flex-wrap justify-center items-center gap-x-6 gap-y-2"
          >
            {footerLinks.map((link, index) => (
              <motion.a
                key={index}
                whileHover={{ color: "#6366f1" }}
                href={link.href}
                className="text-gray-400 hover:text-indigo-400 transition-colors duration-300 text-sm"
              >
                {link.name}
              </motion.a>
            ))}
          </motion.div>

          {/* Copyright Section - Right side */}
          <motion.div
            variants={fadeInUp}
            className="footer-copyright text-gray-500 text-xs"
          >
            © 2026 Skreena. All rights reserved.
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};