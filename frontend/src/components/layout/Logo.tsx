/**
 * Site wordmark. "Ai" is the mark — extra-bold purple, square tittle —
 * then Recruitex. No boxed icon.
 */
export function BrandWordmark({
  className = "text-[1.35rem]",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={`brand-wordmark ${tone === "dark" ? "is-on-dark" : ""} ${className}`}
      aria-label="AiRecruitex"
    >
      <span className="ai" aria-hidden="true">
        A
        <span className="i">ı</span>
      </span>
      <span className="rest" aria-hidden="true">
        Recruitex
      </span>
    </span>
  );
}

export const BRAND_NAME = "AiRecruitex";
