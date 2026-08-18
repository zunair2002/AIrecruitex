import { productShowcaseSlides } from "./slidesData";
import { FeatureVisual } from "./FeatureVisual";

type ShowcaseCarouselProps = {
  trackRef: React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
};

export const ShowcaseCarousel = ({
  trackRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: ShowcaseCarouselProps) => (
  <div
    className="showcase-carousel overflow-hidden"
    style={{ cursor: "grab" }}
    onMouseDown={onMouseDown}
    onMouseMove={onMouseMove}
    onMouseUp={onMouseUp}
    onMouseLeave={onMouseUp}
  >
    <div
      ref={trackRef}
      className="carousel-track flex transition-transform duration-500 ease-out"
    >
      {productShowcaseSlides.map((slide) => (
        <div
          key={slide.id}
          className="carousel-slide flex-shrink-0 px-3"
          style={{ width: "33.333%" }}
        >
          <div className="media-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
            <div className="media-card-image h-56 w-full relative overflow-hidden bg-slate-50/50 border-b border-slate-100">
              <FeatureVisual id={slide.id} />
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
);
