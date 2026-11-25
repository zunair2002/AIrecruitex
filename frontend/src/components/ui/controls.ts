import { buttonClass } from "./Button";

/**
 * Form control class strings — one look for every input, select and textarea
 * in the candidate, HR and admin portals.
 *
 *   <label htmlFor="title" className={labelClass}>Job title</label>
 *   <input id="title" className={inputClass} />
 *   <p className={helpTextClass}>Shown to candidates.</p>
 *   <p className={errorTextClass}>Required.</p>
 *
 * `inputClass` and `compactInputClass` also adapt when put on a <select>
 * (custom chevron) or a <textarea> (auto height), for older call sites.
 */

const FIELD =
  "rounded-lg border border-line bg-white text-sm text-ink placeholder:text-subtle shadow-xs transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted aria-[invalid=true]:border-rose-300 aria-[invalid=true]:focus:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/10";

/**
 * Element-aware tweaks so one string works on input, select and textarea.
 * (Controls also carry a min-height, so `flex-1` in a column layout can't
 * squash them.)
 */
const ADAPTIVE =
  "[&:is(select)]:select-chevron [&:is(select)]:pr-9 [&:is(textarea)]:h-auto [&:is(textarea)]:py-2.5";

/** Default text input (h-10). */
export const inputClass = `block h-10 min-h-10 w-full px-3 ${FIELD} ${ADAPTIVE}`;

/** Native <select> with the custom chevron (h-10). */
export const selectClass = `select-chevron block h-10 min-h-10 w-full pl-3 pr-9 ${FIELD}`;

/** Multi-line text. Add `resize-none` / `rows` as needed. */
export const textareaClass = `block min-h-28 w-full px-3 py-2.5 leading-6 ${FIELD}`;

/** Denser control for toolbars and table cells (h-9). Not full-width by itself. */
export const compactInputClass = `h-9 min-h-9 px-3 ${FIELD} ${ADAPTIVE}`;

export const labelClass = "mb-1.5 block text-sm font-medium text-body";

/** Helper text under a field. */
export const helpTextClass = "mt-1.5 text-xs text-muted";

/** Validation message under a field (pair with aria-invalid on the input). */
export const errorTextClass = "mt-1.5 text-xs text-rose-600";

/** Native checkbox / radio, brand-tinted. Pair with a `text-sm text-body` label. */
export const checkboxClass =
  "size-4 shrink-0 cursor-pointer rounded border-line accent-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/* ---- button strings (same recipes as ui/Button) ---- */

export const primaryButtonClass = buttonClass({ variant: "primary", size: "md" });

export const secondaryButtonClass = buttonClass({
  variant: "secondary",
  size: "md",
});

export const smallButtonClass = buttonClass({ variant: "primary", size: "sm" });

/** Small, quiet destructive action (row-level "Delete"). */
export const dangerButtonClass = buttonClass({
  variant: "danger-soft",
  size: "sm",
});
