import { whiteLabelSlides } from "./slidesData";
import { BrandedPhoneMockup } from "./BrandedPhoneMockup";

type WhiteLabelCarouselProps = {
  trackRef: React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
};

export const WhiteLabelCarousel = ({
  trackRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: WhiteLabelCarouselProps) => (
  <div
    className="showcase-carousel overflow-hidden"
    style={{ cursor: "grab" }}
    onMouseDown={onMouseDown}
    onMouseMove={onMouseMove}
    onMouseUp={onMouseUp}
    onMouseLeave={onMouseUp}
  >
    <div ref={trackRef} className="carousel-track flex transition-transform duration-500 ease-out">
      {whiteLabelSlides.map((slide) => (
        <div key={slide.id} className="carousel-slide flex-shrink-0 px-3 w-full md:w-1/2 lg:w-1/4">
          <div className="media-card bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300 h-full flex flex-col items-center p-6 justify-between">
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
);
