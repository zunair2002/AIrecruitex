"use client";

import type { KeyboardEvent, ReactNode } from "react";

/**
 * Underline tabs for page sections, and a segmented control for small toggles.
 *
 *   <Tabs
 *     ariaLabel="Application status"
 *     tabs={[{ id: "all", label: "All", count: 12 }, { id: "pending", label: "Pending", count: 3 }]}
 *     value={tab}
 *     onChange={setTab}
 *   />
 *
 *   <SegmentedControl
 *     ariaLabel="Chart range"
 *     options={[{ value: "monthly", label: "Monthly" }, { value: "weekly", label: "Weekly" }]}
 *     value={range}
 *     onChange={setRange}
 *   />
 *
 * Route-based tabs (links) can reuse the look: `tabListClass`, `tabClass(active)`,
 * `tabCountClass(active)` with `aria-current="page"` on the active link.
 */

/**
 * Bottom rule that sits under a tab strip. It is a one-column grid
 * (minmax(0, 1fr)) so a long strip scrolls inside it instead of widening
 * whatever column it sits in.
 */
export const tabBarClass = "grid grid-cols-1 border-b border-line";

/** The scrolling row of tabs (sits on the bar's bottom rule). */
export const tabListClass =
  "no-scrollbar -mb-px flex gap-6 overflow-x-auto overflow-y-hidden";

export function tabClass(active: boolean): string {
  return `inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-t-md border-b-2 px-0.5 pb-3 pt-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 ${
    active
      ? "border-brand-600 text-brand-700"
      : "border-transparent text-muted hover:border-line hover:text-ink"
  }`;
}

export function tabCountClass(active: boolean): string {
  return `inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
    active ? "bg-brand-50 text-brand-700" : "bg-surface-3 text-muted"
  }`;
}

export type TabItem<T extends string> = {
  id: T;
  label: ReactNode;
  /** Leading icon. Sized by the tab, so pass a bare lucide element. */
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
};

/** Arrow-key / Home / End navigation between sibling buttons with `selector`. */
function moveFocus(
  event: KeyboardEvent<HTMLElement>,
  selector: string,
): HTMLElement | null {
  const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(event.key)) return null;
  const items = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(selector),
  ).filter((item) => !item.hasAttribute("disabled"));
  const index = items.indexOf(document.activeElement as HTMLElement);
  if (items.length === 0) return null;
  event.preventDefault();
  let next = index;
  if (event.key === "ArrowLeft") next = index <= 0 ? items.length - 1 : index - 1;
  if (event.key === "ArrowRight") next = index >= items.length - 1 ? 0 : index + 1;
  if (event.key === "Home") next = 0;
  if (event.key === "End") next = items.length - 1;
  const target = items[next];
  target?.focus();
  target?.scrollIntoView({ block: "nearest", inline: "nearest" });
  return target ?? null;
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  idPrefix,
  className = "",
}: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
  /**
   * Set to link tabs with their panels: tab ids become `${idPrefix}-tab-${id}`
   * and point at `${idPrefix}-panel-${id}` (give your panel that id,
   * role="tabpanel" and aria-labelledby the tab id).
   */
  idPrefix?: string;
  className?: string;
}) {
  return (
    <div className={`${tabBarClass} ${className}`}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={tabListClass}
        onKeyDown={(event) => {
          const target = moveFocus(event, '[role="tab"]');
          const id = target?.dataset.tabId as T | undefined;
          if (id !== undefined) onChange(id);
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === value;
          // Roving tabindex: the active tab (or the first, if none is) is the
          // single Tab stop; arrow keys move between tabs.
          const isTabStop =
            isActive || (index === 0 && !tabs.some((item) => item.id === value));
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              data-tab-id={tab.id}
              id={idPrefix ? `${idPrefix}-tab-${tab.id}` : undefined}
              aria-controls={idPrefix ? `${idPrefix}-panel-${tab.id}` : undefined}
              aria-selected={isActive}
              tabIndex={isTabStop ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={tabClass(isActive)}
            >
              {tab.icon && (
                <span
                  aria-hidden="true"
                  className="[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0"
                >
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {tab.count !== undefined && (
                <span className={tabCountClass(isActive)}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type SegmentOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  fullWidth = false,
  className = "",
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  /** Stretch to the container width (good on phones). */
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`${fullWidth ? "flex w-full" : "inline-flex"} items-center gap-1 rounded-lg bg-surface-3 p-1 ${className}`}
      onKeyDown={(event) => {
        moveFocus(event, "button");
      }}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&_svg]:size-4 [&_svg]:shrink-0 ${
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm"
            } ${fullWidth ? "flex-1" : ""} ${
              isActive
                ? "bg-white text-ink shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
