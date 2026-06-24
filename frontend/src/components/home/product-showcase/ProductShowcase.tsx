"use client";

import { ShowcaseStyles } from "./ShowcaseStyles";
import { ShowcaseHeader } from "./ShowcaseHeader";
import { ShowcaseCarousel } from "./ShowcaseCarousel";
import { ShowcaseNavigation } from "./ShowcaseNavigation";
import { useProductShowcaseCarousel } from "./useProductShowcaseCarousel";

export const ProductShowcase = () => {
  const carousel = useProductShowcaseCarousel();

  return (
    <section className="product-showcase py-20 bg-white">
      <ShowcaseStyles />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ShowcaseHeader />
        <ShowcaseCarousel
          trackRef={carousel.trackRef}
          onMouseDown={carousel.handleMouseDown}
          onMouseMove={carousel.handleMouseMove}
          onMouseUp={carousel.handleMouseUp}
        />
        <ShowcaseNavigation
          currentIndex={carousel.currentIndex}
          onPrev={carousel.prevSlide}
          onNext={carousel.nextSlide}
          onGoTo={carousel.goToSlide}
        />
      </div>
    </section>
  );
};
