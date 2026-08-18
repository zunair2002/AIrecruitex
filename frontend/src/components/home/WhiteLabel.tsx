"use client";

import { useState, useEffect, useRef } from "react";

// Phone Mockups representing responsive, tall, and slender smartphone branded screens
const BrandedPhoneMockup = ({ id }: { id: number }) => {
  return (
    <div className="w-[180px] h-[320px] bg-slate-900 rounded-[24px] p-2.5 shadow-lg relative border-[3px] border-slate-800 flex flex-col justify-between overflow-hidden select-none hover:scale-105 transition-transform duration-300">
      {/* Speaker and Notch */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-14 h-3 bg-slate-900 rounded-full z-20 flex items-center justify-center">
        <div className="w-5 h-0.5 bg-slate-700 rounded-full" />
      </div>
      
      {/* Branded Screen */}
      <div className="w-full h-full bg-white rounded-[16px] overflow-hidden flex flex-col justify-between border border-slate-100 relative pt-3">
        {id === 1 && (
          <>
            {/* FastTrack Deliveries (Mustard/Amber branding) */}
            <div className="bg-amber-500 h-8 flex items-center justify-center px-2 relative text-white border-b border-amber-600">
              <span className="text-[8px] font-extrabold tracking-wider font-mono">FastTrack</span>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-between bg-slate-50/50">
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Driver Screening</span>
                <span className="text-[7px] font-bold text-slate-800 leading-tight">Question 2 of 5</span>
                <p className="text-[7.5px] text-slate-700 font-semibold leading-relaxed mt-1">
                  "Do you hold a clean commercial driving license?"
                </p>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                <div className="h-4.5 bg-amber-500 rounded flex items-center justify-center font-bold text-[6.5px] text-white shadow-sm cursor-pointer hover:bg-amber-600">
                  Yes, Clean Record
                </div>
                <div className="h-4.5 bg-white border border-amber-500 rounded flex items-center justify-center font-bold text-[6.5px] text-amber-600 cursor-pointer hover:bg-amber-50">
                  No, Minor Violations
                </div>
              </div>
            </div>
          </>
        )}

        {id === 2 && (
          <>
            {/* Swift Recruitment (Teal branding) */}
            <div className="bg-teal-700 h-8 flex items-center justify-center px-2 relative text-white border-b border-teal-800">
              <span className="text-[8px] font-extrabold tracking-wider font-mono">SWIFT RECRUIT</span>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-between bg-slate-50/50">
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Consulting Placement</span>
                <span className="text-[7px] font-bold text-slate-800 leading-tight">Question 1 of 4</span>
                <p className="text-[7.5px] text-slate-700 font-semibold leading-relaxed mt-1">
                  "Explain how you manage high-stress environments."
                </p>
              </div>
              {/* Mic Icon pulse container */}
              <div className="flex flex-col items-center justify-center gap-1 my-1">
                <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-md animate-pulse cursor-pointer">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                </div>
                <span className="text-[5px] text-teal-600 font-bold animate-pulse">Recording Answer...</span>
              </div>
            </div>
          </>
        )}

        {id === 3 && (
          <>
            {/* The Local Kitchen (Coral Orange branding) */}
            <div className="bg-orange-500 h-8 flex items-center justify-center px-2 relative text-white border-b border-orange-600">
              <span className="text-[8px] font-extrabold tracking-wider font-mono">LOCAL KITCHEN</span>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-between bg-slate-50/50">
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Staff Auditing</span>
                <span className="text-[7px] font-bold text-slate-800 leading-tight">Question 3 of 6</span>
                <p className="text-[7.5px] text-slate-700 font-semibold leading-relaxed mt-1">
                  "Do you hold a valid local food handlers card?"
                </p>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                <div className="h-4.5 bg-orange-500 rounded flex items-center justify-center font-bold text-[6.5px] text-white shadow-sm cursor-pointer">
                  Yes, Active Card
                </div>
                <div className="h-4.5 bg-white border border-orange-500 rounded flex items-center justify-center font-bold text-[6.5px] text-orange-600 cursor-pointer">
                  No, Obtaining soon
                </div>
              </div>
            </div>
          </>
        )}

        {id === 4 && (
          <>
            {/* TechStart Solutions (Indigo branding) */}
            <div className="bg-indigo-600 h-8 flex items-center justify-center px-2 relative text-white border-b border-indigo-700">
              <span className="text-[8px] font-extrabold tracking-wider font-mono">TECHSTART</span>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-between bg-slate-50/50">
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Software Engineering</span>
                <span className="text-[7px] font-bold text-slate-800 leading-tight">Question 4 of 5</span>
                <p className="text-[7.5px] text-slate-700 font-semibold leading-relaxed mt-1">
                  "Briefly outline JavaScript closures."
                </p>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                <div className="h-7 w-full bg-white border border-slate-200 rounded p-1 text-[5px] text-slate-400 font-mono flex items-start select-text overflow-hidden">
                  {'const closure = () => ...'}
                </div>
                <div className="h-4.5 bg-indigo-600 rounded flex items-center justify-center font-bold text-[6.5px] text-white shadow-sm cursor-pointer">
                  Submit Answer
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Universal Brand Footer */}
        <div className="h-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center select-none">
          <span className="text-[5px] text-slate-400 font-medium">Powered by Skreena</span>
        </div>
      </div>
    </div>
  );
};

const whiteLabelSlides = [
  {
    id: 1,
    title: "FastTrack Deliveries",
    description:
      "Logistics company screening drivers with their own custom yellow branding and colors.",
  },
  {
    id: 2,
    title: "Swift Recruitment",
    description:
      "Recruitment agency using deep teal layouts to deliver a sleek and professional candidate appearance.",
  },
  {
    id: 3,
    title: "The Local Kitchen",
    description:
      "Restaurant hiring kitchen staff with warm, inviting terracotta brand styling.",
  },
  {
    id: 4,
    title: "TechStart Solutions",
    description:
      "Fast-growing startup selecting software developers with futuristic indigo-branded code consoles.",
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

  // Auto-slide every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3500);
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
      const getSlideWidth = () => {
        if (typeof window !== "undefined") {
          if (window.innerWidth >= 1024) return 25; // 4 cards on desktop
          if (window.innerWidth >= 768) return 50;  // 2 cards on tablet
        }
        return 100; // 1 card on mobile
      };
      
      const slideWidth = getSlideWidth();
      // On desktop, indexToUse is 0 because all cards fit side-by-side
      const indexToUse = slideWidth === 25 ? 0 : currentIndex;
      track.style.transform = `translateX(calc(-${indexToUse * slideWidth}% + ${translateX}px))`;
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

        {/* Carousel (Responsive: grid-like on desktop, draggable carousel on tablet/mobile) */}
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
                className="carousel-slide flex-shrink-0 px-3 w-full md:w-1/2 lg:w-1/4"
              >
                <div className="media-card bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300 h-full flex flex-col items-center p-6 justify-between">
                  {/* Smartphone Frame Visual (Tall height, narrow width) */}
                  <div className="w-full flex justify-center mb-6 mt-2">
                    <BrandedPhoneMockup id={slide.id} />
                  </div>
                  
                  <div className="media-card-content text-center mt-2 flex flex-col gap-2.5">
                    <h3
                      className="media-card-title"
                      style={{
                        fontSize: "19px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: "bold",
                        color: "#1F2937",
                        margin: 0,
                      }}
                    >
                      {slide.title}
                    </h3>
                    <p
                      className="media-card-description"
                      style={{
                        fontSize: "13.5px",
                        fontFamily: "'Inter', sans-serif",
                        color: "#4B5563",
                        lineHeight: "1.55",
                        margin: 0,
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

        {/* Navigation - Only visible on screens where sliding is needed (< desktop) */}
        <div className="carousel-nav flex lg:hidden items-center justify-center gap-4 mt-8">
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
