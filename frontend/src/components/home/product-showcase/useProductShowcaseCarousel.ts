"use client";

import { useState, useEffect, useRef } from "react";
import { productShowcaseSlides } from "./slidesData";

export function useProductShowcaseCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const slideCount = productShowcaseSlides.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    if (trackRef.current) {
      trackRef.current.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    setTranslateX(deltaX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.style.cursor = "grab";
    }

    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    setTranslateX(0);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (track) {
      const slideWidth = 33.333;
      track.style.transform = `translateX(calc(-${currentIndex * slideWidth}% + ${translateX}px))`;
    }
  }, [currentIndex, translateX]);

  return {
    currentIndex,
    trackRef,
    nextSlide,
    prevSlide,
    goToSlide,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
