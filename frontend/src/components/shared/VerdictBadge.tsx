import {
  TURN_VERDICT_BADGE,
  TURN_VERDICT_LABELS,
  badgeClass,
} from "@/lib/format";
import type { TurnVerdict } from "@/lib/types";

/** Coloured badge for a turn's model verdict; nothing for an empty verdict. */
export function VerdictBadge({ verdict }: { verdict?: TurnVerdict | "" }) {
  if (!verdict) return null;
  return (
    <span className={TURN_VERDICT_BADGE[verdict] ?? badgeClass("bg-gray-100 text-gray-600")}>
      {TURN_VERDICT_LABELS[verdict] ?? String(verdict).replace(/_/g, " ")}
    </span>
  );
}
