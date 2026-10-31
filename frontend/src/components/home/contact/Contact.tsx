"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { fadeInUp, fadeInLeft, fadeInRight } from "./animationVariants";
import { ContactInfoPanel } from "./ContactInfoPanel";
import { ContactForm, useContactForm } from "./ContactForm";

export const Contact = () => {
  const form = useContactForm();
  const sectionRef = useRef(null);
  const isSectionInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const sectionControls = useAnimation();

  useEffect(() => {
    if (isSectionInView) sectionControls.start("visible");
  }, [isSectionInView, sectionControls]);

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate={sectionControls}
      variants={fadeInUp}
      className="bg-[#f6f3f9] py-24"
      id="contact"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="contact-wrapper grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2">
          <motion.div
            variants={fadeInLeft}
            className="contact-info flex h-full flex-col justify-center"
          >
            <ContactInfoPanel
              activeMode={form.activeMode}
              onModeChange={form.handleModeChange}
            />
          </motion.div>
          <motion.div variants={fadeInRight} className="contact-form-card">
            <ContactForm
              activeMode={form.activeMode}
              formData={form.formData}
              isLoading={form.isLoading}
              isSubmitted={form.isSubmitted}
              onInputChange={form.handleInputChange}
              onSubmit={form.handleSubmit}
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
