"use client";

import { useState, useEffect, useRef } from "react";
import { useInView, useAnimation } from "framer-motion";
import { powerfulFeaturesScenes } from "./scenesData";

export function usePowerfulFeaturesState() {
  const [activeScene, setActiveScene] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const carouselRef = useRef(null);
  const moreFeaturesRef = useRef(null);

  const isSectionInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isCarouselInView = useInView(carouselRef, { once: true, amount: 0.3 });
  const isMoreFeaturesInView = useInView(moreFeaturesRef, { once: true, amount: 0.3 });

  const sectionControls = useAnimation();
  const headerControls = useAnimation();
  const carouselControls = useAnimation();
  const moreFeaturesControls = useAnimation();

  useEffect(() => {
    if (isSectionInView) sectionControls.start("visible");
    if (isHeaderInView) headerControls.start("visible");
    if (isCarouselInView) carouselControls.start("visible");
    if (isMoreFeaturesInView) moreFeaturesControls.start("visible");
  }, [
    isSectionInView,
    isHeaderInView,
    isCarouselInView,
    isMoreFeaturesInView,
    sectionControls,
    headerControls,
    carouselControls,
    moreFeaturesControls,
  ]);

  const nextScene = () => {
    setActiveScene((prev) => (prev + 1) % powerfulFeaturesScenes.length);
  };

  const prevScene = () => {
    setActiveScene((prev) => (prev - 1 + powerfulFeaturesScenes.length) % powerfulFeaturesScenes.length);
  };

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translateX(-${activeScene * 100}%)`;
    }
  }, [activeScene]);

  return {
    activeScene,
    wrapperRef,
    sectionRef,
    headerRef,
    carouselRef,
    moreFeaturesRef,
    sectionControls,
    headerControls,
    carouselControls,
    moreFeaturesControls,
    nextScene,
    prevScene,
    setActiveScene,
  };
}
