"use client";

import { motion } from "framer-motion";
import { contactInfo, type ContactMode } from "./contactData";

type ContactInfoPanelProps = {
  activeMode: ContactMode;
  onModeChange: (mode: ContactMode) => void;
};

export const ContactInfoPanel = ({ activeMode, onModeChange }: ContactInfoPanelProps) => (
  <div className="contact-info flex flex-col justify-center h-full">
    <div className="contact-toggle flex flex-wrap gap-3 mb-8">
      {(["demo", "recruit"] as ContactMode[]).map((mode) => (
        <button
          key={mode}
          className={`contact-toggle-btn px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
            activeMode === mode ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => onModeChange(mode)}
        >
          {mode === "demo" ? "Book a Demo" : "We Need Recruitment Help"}
        </button>
      ))}
    </div>

    <motion.h2
      key={activeMode}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
    >
      {contactInfo[activeMode].heading}
    </motion.h2>

    <motion.p
      key={activeMode + "text"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="text-gray-600 mb-8 leading-relaxed"
    >
      {contactInfo[activeMode].subtext}
    </motion.p>

    <div className="contact-details space-y-4">
      <div className="contact-item flex items-center gap-3 text-gray-600">
        <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <a href="mailto:hello@skreena.com" className="hover:text-indigo-600 transition-colors">hello@skreena.com</a>
      </div>
      <div className="contact-item flex items-center gap-3 text-gray-600">
        <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>London, United Kingdom</span>
      </div>
    </div>
  </div>
);
