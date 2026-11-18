/**
 * Table class strings. Tables live inside a Card/Panel and bleed to its edges;
 * the first and last columns line up with the card's own padding.
 *
 *   <Card title="Users">
 *     <div className={tableWrapClass}>
 *       <table className={tableClass}>
 *         <thead><tr><th className={thClass}>User</th>…</tr></thead>
 *         <tbody><tr className={trClass}><td className={tdClass}>…</td></tr></tbody>
 *       </table>
 *     </div>
 *   </Card>
 *
 * On phones prefer a stacked list for primary lists:
 *   <ul className={`md:hidden ${stackedListClass}`}>…</ul>
 *   <div className={`hidden md:block ${tableWrapClass}`}>…table…</div>
 */

/** Scroll wrapper that bleeds to the edges of a padded Card/Panel (p-5 sm:p-6). */
export const tableWrapClass = "-mx-5 overflow-x-auto sm:-mx-6";

/** Scroll wrapper without the bleed (Card padding="none", or no card). */
export const tableScrollClass = "overflow-x-auto";

/** A card that holds a table flush to its edges, with no padding of its own. */
export const tableCardClass =
  "min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-xs";

export const tableClass = "min-w-full text-sm";

export const thClass =
  "whitespace-nowrap bg-surface-2 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6";

/** Body cell. Inherits the body text colour, so a colour class on the cell wins. */
export const tdClass =
  "px-4 py-3.5 align-middle first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6";

/** Body row: hairline divider + hover tint. */
export const trClass =
  "border-t border-line-soft transition-colors hover:bg-surface-2/60";

/** Add to th/td for numbers (scores, counts, money). */
export const numericCellClass = "text-right tabular-nums";

/* ---- phone layout: stacked rows instead of a table ---- */

/** A divided list that bleeds to card edges, like the table. */
export const stackedListClass =
  "-mx-5 divide-y divide-line-soft border-t border-line-soft sm:-mx-6";

/** One row of a stacked list. */
export const stackedItemClass = "px-5 py-4 sm:px-6";

/** A standalone small card for list items (job cards, mobile rows). */
export const listCardClass =
  "rounded-xl border border-line bg-surface p-4 shadow-xs transition-colors hover:border-brand-200";
