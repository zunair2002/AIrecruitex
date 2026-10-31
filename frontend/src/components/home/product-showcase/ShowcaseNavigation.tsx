import { productShowcaseSlides } from "./slidesData";

type ShowcaseNavigationProps = {
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
};

export const ShowcaseNavigation = ({
  currentIndex,
  onPrev,
  onNext,
  onGoTo,
}: ShowcaseNavigationProps) => (
  <div className="mt-8 flex items-center justify-center gap-4">
    <button className="carousel-btn" onClick={onPrev} aria-label="Previous slide">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" strokeWidth="2" />
      </svg>
    </button>
    <div className="flex items-center gap-2">
      {productShowcaseSlides.map((_, index) => (
        <button
          key={index}
          className={`carousel-dot ${currentIndex === index ? "is-active" : ""}`}
          onClick={() => onGoTo(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
    <button className="carousel-btn" onClick={onNext} aria-label="Next slide">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polyline points="9 18 15 12 9 6" strokeWidth="2" />
      </svg>
    </button>
  </div>
);
