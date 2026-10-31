"use client";

import { motion } from "framer-motion";
import { contactInfo, type ContactMode } from "./contactData";

type ContactInfoPanelProps = {
  activeMode: ContactMode;
  onModeChange: (mode: ContactMode) => void;
};

export const ContactInfoPanel = ({
  activeMode,
  onModeChange,
}: ContactInfoPanelProps) => (
  <div className="flex h-full flex-col justify-center">
    <p className="eyebrow">Contact</p>
    <div className="mt-8 mb-8 flex flex-wrap gap-2">
      {(["demo", "recruit"] as ContactMode[]).map((mode) => (
        <button
          key={mode}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeMode === mode
              ? "bg-navy text-white"
              : "border border-[#e0d6ea] bg-white text-[#6b5f7a] hover:border-ink hover:text-ink"
          }`}
          onClick={() => onModeChange(mode)}
        >
          {mode === "demo" ? "Book a briefing" : "Recruitment support"}
        </button>
      ))}
    </div>

    <motion.h2
      key={activeMode}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="font-display text-3xl text-ink sm:text-4xl"
    >
      {contactInfo[activeMode].heading}
    </motion.h2>

    <motion.p
      key={activeMode + "text"}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="mt-4 leading-relaxed text-[#6b5f7a]"
    >
      {contactInfo[activeMode].subtext}
    </motion.p>

    <div className="mt-8 space-y-3 text-sm text-[#6b5f7a]">
      <a href="mailto:hello@airecruitex.com" className="block hover:text-ink">
        hello@airecruitex.com
      </a>
      <p>London, United Kingdom</p>
    </div>
  </div>
);
