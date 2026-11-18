/**
 * Site wordmark. "Ai" is the mark — extra-bold violet, square tittle —
 * then Recruitex. No boxed icon. Size it with a text class, e.g. `text-xl`.
 *
 *   <BrandWordmark className="text-xl" />                 on light backgrounds
 *   <BrandWordmark className="text-xl" tone="onDark" />   on dark (sidebar, footer)
 */
export function BrandWordmark({
  className = "text-[1.35rem]",
  tone = "light",
}: {
  className?: string;
  /** Background it sits on. `dark` and `onDark` are the same variant. */
  tone?: "light" | "dark" | "onDark";
}) {
  const onDark = tone === "dark" || tone === "onDark";
  return (
    <span
      className={`brand-wordmark ${onDark ? "is-on-dark" : ""} ${className}`}
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
