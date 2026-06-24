"use client";

import { useEffect, useRef } from "react";
import { useInView, useAnimation } from "framer-motion";

export function useRaasAnimations() {
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

  useEffect(() => {
    if (isSectionInView) sectionControls.start("visible");
    if (isContentInView) contentControls.start("visible");
    if (isFeaturesInView) featuresControls.start("visible");
    if (isCtaInView) ctaControls.start("visible");
  }, [isSectionInView, isContentInView, isFeaturesInView, isCtaInView, sectionControls, contentControls, featuresControls, ctaControls]);

  return { sectionRef, contentRef, featuresRef, ctaRef, sectionControls, contentControls, featuresControls, ctaControls };
}
