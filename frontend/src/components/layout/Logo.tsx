/**
 * The AiRecruitex brand mark. Matches `src/app/icon.svg`.
 */
export function LogoMark({
  className = "h-9 w-9",
  rounded = "rounded-sm",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`${className} ${rounded} flex shrink-0 items-center justify-center bg-brand`}
    >
      <svg
        viewBox="0 0 64 64"
        className="h-[58%] w-[58%]"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M17 47 L32 17 L47 47"
          stroke="white"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23.5 38.5 L40.5 38.5"
          stroke="white"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export const BRAND_NAME = "AiRecruitex";
