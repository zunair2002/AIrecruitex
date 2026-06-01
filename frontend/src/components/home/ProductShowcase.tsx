"use client";

import { useState, useEffect, useRef } from "react";

const slides = [
  {
    id: 1,
    image: "/landing/images/white-label-branding.png",
    title: "Your Brand, Your Interview",
    description:
      "Custom branding per job. Your logo, colours, and company name throughout the interview.",
  },
  {
    id: 2,
    image: "/landing/images/ai-interview.png",
    title: "AI That Feels Human",
    description:
      "Natural conversations that dig deeper with follow-up questions tailored to each response.",
  },
  {
    id: 3,
    image: "/landing/images/interviews-autopilot.png",
    title: "Interviews on Autopilot",
    description:
      "Candidates complete interviews on their schedule. No calls, no scheduling, no no-shows.",
  },
  {
    id: 4,
    image: "/landing/images/smart-scoring.png",
    title: "Smart Scoring System",
    description:
      "Dual-agent AI consensus ensures accurate, unbiased match scores for fair, reliable rankings.",
  },
  {
    id: 5,
    image: "/landing/images/discrepancy-detection.png",
    title: "Discrepancy Detection",
    description:
      "AI flags mismatches between CV claims and interview answers to catch embellishments.",
  },
  {
    id: 6,
    image: "/landing/images/anti-cheat.png",
    title: "Anti-Cheat Protection",
    description:
      "Optional timed questions and follow-up questions ensure authentic candidate responses.",
  },
  {
    id: 7,
    image: "/landing/images/cv-parsing.png",
    title: "CV Parsing",
    description:
      "Automatically extract and analyze key information from candidate CVs to save time.",
  },
  {
    id: 8,
    image: "/landing/images/candidate-insights.png",
    title: "Candidate Insights",
    description:
      "Deep analysis of candidate responses with detailed scoring breakdowns.",
  },
  {
    id: 9,
    image: "/landing/images/email-notifications.png",
    title: "Email Notifications",
    description:
      "Automatic email updates when candidates complete interviews or when shortlists are ready.",
  },
];

export const ProductShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-slide every 3 seconds
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

  const handleMouseUp = (e: React.MouseEvent) => {
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

  return (
    <section className="product-showcase py-20 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="carousel-header text-center mb-16">
          <p
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
            Features.
          </p>
          <h2
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
          </h2>
        </div>

        {/* Carousel */}
        <div
          className="showcase-carousel overflow-hidden"
          style={{ cursor: "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={trackRef}
            className="carousel-track flex transition-transform duration-500 ease-out"
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="carousel-slide flex-shrink-0 px-3"
                style={{ width: "33.333%" }}
              >
                <div className="media-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className="media-card-image">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      loading="lazy"
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/400x250/6366f1/white?text=${slide.title}`;
                      }}
                    />
                  </div>
                  <div className="media-card-content p-6">
                    <h3
                      className="media-card-title"
                      style={{
                        fontSize: "20px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: "bold",
                        color: "#1F2937",
                        marginBottom: "12px",
                      }}
                    >
                      {slide.title}
                    </h3>
                    <p
                      className="media-card-description"
                      style={{
                        fontSize: "14px",
                        fontFamily: "'Inter', sans-serif",
                        color: "#4B5563",
                        lineHeight: "1.6",
                      }}
                    >
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="carousel-nav flex items-center justify-center gap-4 mt-8">
          <button
            className="carousel-btn w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="carousel-dots flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot rounded-full transition-all ${
                  currentIndex === index
                    ? "w-6 bg-indigo-600"
                    : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                }`}
                style={{ height: "8px" }}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            className="carousel-btn w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};
