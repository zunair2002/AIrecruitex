import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";

/**
 * Buttons — the one recipe every clickable action in the product uses.
 *
 *   <Button>Save</Button>                               primary, md
 *   <Button variant="secondary" size="sm">Cancel</Button>
 *   <Button href="/recruiter/jobs/create" leadingIcon={<Plus />}>Create job</Button>
 *   <Button type="submit" loading={isSaving}>Save changes</Button>
 *   <IconButton label="Close" onClick={onClose}><X /></IconButton>
 *
 * Need the look on something that isn't a <button>/<Link>? Use `buttonClass()`.
 * Icons inside are sized automatically (16px; 20px in md/lg icon buttons).
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "soft"
  | "danger-soft";

export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:shrink-0";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand-700 text-white shadow-xs hover:bg-brand-800",
  secondary:
    "border border-line bg-white text-body shadow-xs hover:bg-surface-2 hover:text-ink",
  ghost: "text-body hover:bg-surface-3 hover:text-ink",
  danger: "bg-rose-600 text-white shadow-xs hover:bg-rose-700",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  /** Quiet destructive action (row-level "Delete", "Remove"). */
  "danger-soft": "bg-rose-50 text-rose-700 hover:bg-rose-100",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm [&_svg]:size-4",
  md: "h-10 px-4 text-sm [&_svg]:size-4",
  lg: "h-11 px-5 text-base [&_svg]:size-4",
};

const ICON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 w-8 [&_svg]:size-4",
  md: "h-10 w-10 [&_svg]:size-5",
  lg: "h-11 w-11 [&_svg]:size-5",
};

type ClassOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

/** Class string for the button look — `buttonClass({ variant: "secondary", size: "sm" })`. */
export function buttonClass({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: ClassOptions = {}): string {
  return [BASE, VARIANTS[variant], SIZES[size], fullWidth ? "w-full" : "", className]
    .filter(Boolean)
    .join(" ");
}

/** Square icon-only button look. Default variant is `ghost`. */
export function iconButtonClass({
  variant = "ghost",
  size = "md",
  className = "",
}: Omit<ClassOptions, "fullWidth"> = {}): string {
  return [BASE, VARIANTS[variant], ICON_SIZES[size], className]
    .filter(Boolean)
    .join(" ");
}

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Shows a spinner in place of `leadingIcon` and disables the button. */
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
};

type NativeButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type LinkButtonProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | "href"> & {
    /** Renders a Next `<Link>` instead of a `<button>`. */
    href: string;
    disabled?: boolean;
    prefetch?: boolean;
    replace?: boolean;
    scroll?: boolean;
  };

export type ButtonProps = NativeButtonProps | LinkButtonProps;

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = buttonClass({ variant, size, fullWidth, className });
  const content = (
    <>
      {loading ? (
        <LoaderCircle aria-hidden="true" className="animate-spin" />
      ) : (
        leadingIcon
      )}
      {children}
      {trailingIcon}
    </>
  );

  if (typeof rest.href === "string") {
    const { href, disabled, ...linkProps } = rest as Omit<
      LinkButtonProps,
      keyof BaseProps
    >;
    if (disabled || loading) {
      return (
        <span aria-disabled="true" className={classes}>
          {content}
        </span>
      );
    }
    return (
      <Link href={href} className={classes} {...linkProps}>
        {content}
      </Link>
    );
  }

  const {
    type = "button",
    disabled,
    ...buttonProps
  } = rest as Omit<NativeButtonProps, keyof BaseProps | "href">;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...buttonProps}
    >
      {content}
    </button>
  );
}

/** Icon-only button. `label` becomes the accessible name (and tooltip). */
export function IconButton({
  label,
  variant = "ghost",
  size = "md",
  className,
  type = "button",
  children,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={iconButtonClass({ variant, size, className })}
      {...rest}
    >
      {children}
    </button>
  );
}
