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
      className="contact py-20 bg-gray-50 min-h-screen flex items-center"
      id="contact"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="contact-wrapper grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeInLeft} className="contact-info flex flex-col justify-center h-full">
            <ContactInfoPanel activeMode={form.activeMode} onModeChange={form.handleModeChange} />
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
