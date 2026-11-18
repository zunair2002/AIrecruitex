import { initials } from "@/lib/format";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

const TONES = {
  brand: "bg-brand-100 text-brand-700",
  neutral: "bg-surface-3 text-body",
} as const;

/**
 * A person's photo, or their initials when there is none.
 *
 *   <Avatar name={user.name} src={user.avatarUrl} size="sm" />
 *
 * Decorative by default (the name is normally printed next to it); pass
 * `label` when the avatar stands alone and must be announced.
 */
export function Avatar({
  name,
  src,
  size = "md",
  tone = "brand",
  label,
  className = "",
}: {
  name: string;
  src?: string | null;
  /** 32 / 40 / 48 / 64 px. */
  size?: AvatarSize;
  tone?: keyof typeof TONES;
  label?: string;
  className?: string;
}) {
  const base = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${SIZES[size]} ${className}`;
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={label ?? ""}
        referrerPolicy="no-referrer"
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <span {...a11y} className={`${base} select-none font-semibold ${TONES[tone]}`}>
      {initials(name) || "?"}
    </span>
  );
}
