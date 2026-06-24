"use client";

import { WhiteLabelHeader } from "./WhiteLabelHeader";
import { WhiteLabelCarousel } from "./WhiteLabelCarousel";
import { WhiteLabelNavigation } from "./WhiteLabelNavigation";
import { useWhiteLabelCarousel } from "./useWhiteLabelCarousel";

export const WhiteLabel = () => {
  const carousel = useWhiteLabelCarousel();

  return (
    <section className="white-label-section py-20 bg-gray-50" id="white-label">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <WhiteLabelHeader />
        <WhiteLabelCarousel
          trackRef={carousel.trackRef}
          onMouseDown={carousel.handleMouseDown}
          onMouseMove={carousel.handleMouseMove}
          onMouseUp={carousel.handleMouseUp}
        />
        <WhiteLabelNavigation
          currentIndex={carousel.currentIndex}
          onPrev={carousel.prevSlide}
          onNext={carousel.nextSlide}
          onGoTo={carousel.goToSlide}
        />
      </div>
    </section>
  );
};
