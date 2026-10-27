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
    className="overflow-hidden"
    style={{ cursor: "grab" }}
    onMouseDown={onMouseDown}
    onMouseMove={onMouseMove}
    onMouseUp={onMouseUp}
    onMouseLeave={onMouseUp}
  >
    <div
      ref={trackRef}
      className="flex transition-transform duration-500 ease-out"
    >
      {productShowcaseSlides.map((slide) => (
        <div
          key={slide.id}
          className="w-full shrink-0 px-2 md:w-1/2 lg:w-1/3"
        >
          <article className="framed-card flex h-full flex-col overflow-hidden">
            <div className="relative h-52 overflow-hidden bg-[#f6f3f9]">
              <FeatureVisual id={slide.id} />
            </div>
            <div className="flex flex-1 flex-col border-t border-[#e0d6ea] bg-white p-6">
              <h3 className="font-display text-xl text-ink">{slide.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6b5f7a]">
                {slide.description}
              </p>
            </div>
          </article>
        </div>
      ))}
    </div>
  </div>
);
