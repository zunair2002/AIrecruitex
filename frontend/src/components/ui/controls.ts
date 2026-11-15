/**
 * Shared form control classes.
 *
 * Sized and coloured to match `components/dashboard/primitives` so forms in the
 * candidate, HR and admin portals read as one product.
 */

export const inputClass =
  "w-full rounded border border-[#e3e4ec] bg-white px-3 py-2 text-[12px] text-[#292b35] placeholder:text-[#b4b6c0] transition-colors focus:border-[#6b5ce7] focus:outline-none";

export const compactInputClass =
  "rounded border border-[#e3e4ec] bg-white px-2.5 py-1.5 text-[11px] text-[#292b35] placeholder:text-[#b4b6c0] transition-colors focus:border-[#6b5ce7] focus:outline-none";

export const labelClass =
  "mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.07em] text-[#898b96]";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded bg-[#6b5ce7] px-4 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#5849d1] disabled:cursor-not-allowed disabled:opacity-50";

export const smallButtonClass =
  "inline-flex items-center justify-center gap-1 rounded bg-[#6b5ce7] px-2.5 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#5849d1] disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded border border-[#e3e4ec] bg-white px-4 py-2 text-[11px] font-semibold text-[#44464f] transition-colors hover:bg-[#f3f3f6] disabled:cursor-not-allowed disabled:opacity-50";

export const dangerButtonClass =
  "inline-flex items-center justify-center gap-1 rounded border border-rose-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50";
