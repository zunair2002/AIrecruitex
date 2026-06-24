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
  <div className="carousel-nav flex items-center justify-center gap-4 mt-8">
    <button
      className="carousel-btn w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
      onClick={onPrev}
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
      {productShowcaseSlides.map((_, index) => (
        <button
          key={index}
          className={`carousel-dot rounded-full transition-all ${
            currentIndex === index
              ? "w-6 bg-indigo-600"
              : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
          }`}
          style={{ height: "8px" }}
          onClick={() => onGoTo(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>

    <button
      className="carousel-btn w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
      onClick={onNext}
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
);
