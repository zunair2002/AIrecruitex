/**
 * The AiRecruitex brand mark, defined once so the tab icon, the navbar, the
 * footer, the auth cards and the portal sidebars can't drift apart.
 *
 * The gradient matches `src/app/icon.svg`, which the App Router serves as the
 * favicon — change one and change the other.
 */
export function LogoMark({
  className = "h-10 w-10",
  rounded = "rounded-xl",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`${className} ${rounded} flex shrink-0 items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md`}
    >
      <svg
        viewBox="0 0 64 64"
        className="h-[60%] w-[60%]"
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

/** Product name, styled consistently wherever the wordmark appears. */
export const BRAND_NAME = "AiRecruitex";
