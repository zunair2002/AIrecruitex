"use client";

import { useState, useEffect, useRef } from "react";

const whiteLabelSlides = [
  {
    id: 1,
    image: "/landing/images/FastTrack-App.png",
    title: "FastTrack Deliveries",
    description:
      "Logistics company screening drivers with their own branding and colours.",
  },
  {
    id: 2,
    image: "/landing/images/Swift-App.png",
    title: "Swift Recruitment",
    description:
      "Recruitment agency with custom logo and professional appearance.",
  },
  {
    id: 3,
    image: "/landing/images/Restaurant-App.png",
    title: "The Local Kitchen",
    description:
      "Restaurant hiring hospitality staff with warm, inviting brand colours.",
  },
  {
    id: 4,
    image: "/landing/images/FastTrack-App.png",
    title: "TechStart Solutions",
    description: "Tech company hiring developers with modern, sleek branding.",
  },
];

export const WhiteLabel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % whiteLabelSlides.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + whiteLabelSlides.length) % whiteLabelSlides.length,
    );
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
      const slideWidth = 50; // 50% for 2 slides visible at a time
      track.style.transform = `translateX(calc(-${currentIndex * slideWidth}% + ${translateX}px))`;
    }
  }, [currentIndex, translateX]);

  return (
    <section className="white-label-section py-20 bg-gray-50" id="white-label">
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
            Your{" "}
            <span className="hw" style={{ fontWeight: "600" }}>
              Brand
            </span>
            , Front and Centre
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
            White label in seconds. No code required.
          </h2>
        </div>

        {/* Carousel - 2 cards at a time */}
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
            {whiteLabelSlides.map((slide) => (
              <div
                key={slide.id}
                className="carousel-slide flex-shrink-0 px-3"
                style={{ width: "50%" }}
              >
                <div className="media-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className="media-card-image">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      loading="lazy"
                      className="w-full h-80 object-cover"
                      style={{ height: "320px" }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/400x350/6366f1/white?text=${slide.title}`;
                      }}
                    />
                  </div>
                  <div className="media-card-content p-6 text-center">
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
            {whiteLabelSlides.map((_, index) => (
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
