"use client";

import { useEffect, useRef, useState } from "react";

const slides = [
  {
    id: 1,
    title: "FastTrack Deliveries",
    sector: "Logistics",
    description:
      "Driver screening in the company’s own colours, logo, and interview flow.",
  },
  {
    id: 2,
    title: "Swift Recruitment",
    sector: "Agency",
    description:
      "A white-labelled candidate experience that still feels like the agency brand.",
  },
  {
    id: 3,
    title: "The Local Kitchen",
    sector: "Hospitality",
    description:
      "Hospitality hiring with warm brand styling across every interview screen.",
  },
  {
    id: 4,
    title: "TechStart Solutions",
    sector: "Technology",
    description:
      "Developer screening under the startup’s own identity — no AiRecruitex chrome.",
  },
];

export const WhiteLabel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (track) {
      track.style.transform = `translateX(calc(-${currentIndex * 50}% + ${translateX}px))`;
    }
  }, [currentIndex, translateX]);

  return (
    <section className="bg-[#f6f3f9] py-24" id="white-label">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="eyebrow">White label</p>
          <h2 className="font-display mt-5 text-4xl text-ink md:text-5xl">
            Your brand, front and centre
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#6b5f7a]">
            Candidates see your identity throughout the interview. No code, no
            extra engineering.
          </p>
        </div>

        <div
          className="overflow-hidden"
          style={{ cursor: "grab" }}
          onMouseDown={(e) => {
            setIsDragging(true);
            setStartX(e.clientX);
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            setTranslateX(e.clientX - startX);
          }}
          onMouseUp={() => {
            if (!isDragging) return;
            setIsDragging(false);
            if (Math.abs(translateX) > 50) {
              translateX > 0 ? prevSlide() : nextSlide();
            }
            setTranslateX(0);
          }}
          onMouseLeave={() => {
            setIsDragging(false);
            setTranslateX(0);
          }}
        >
          <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-out"
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="w-full shrink-0 px-2 md:w-1/2"
              >
                <article className="framed-card overflow-hidden">
                  <div className="flex h-56 flex-col justify-between bg-navy p-8">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
                      {slide.sector}
                    </p>
                    <h3 className="font-display text-3xl text-white">
                      {slide.title}
                    </h3>
                  </div>
                  <div className="bg-white p-6">
                    <p className="text-sm leading-relaxed text-[#6b5f7a]">
                      {slide.description}
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button className="carousel-btn" onClick={prevSlide} aria-label="Previous">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" strokeWidth="2" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${currentIndex === index ? "is-active" : ""}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button className="carousel-btn" onClick={nextSlide} aria-label="Next">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};
