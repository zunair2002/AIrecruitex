/**
 * The AiRecruitex UI kit. Import from here:
 *
 *   import { Button, Badge, Card, PageHeader, inputClass } from "@/components/ui";
 *
 * Named re-exports only (no `export *`), so this barrel is safe to import from
 * both server and client components.
 */

export {
  Button,
  IconButton,
  buttonClass,
  iconButtonClass,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from "./Button";

export {
  Badge,
  StatusBadge,
  scoreTone,
  statusTone,
  badgeClass,
  BADGE_TONES,
  BADGE_DOTS,
  type BadgeTone,
  type StatusContext,
  type StatusTone,
} from "./Badge";

export { Avatar, type AvatarSize } from "./Avatar";

export {
  Tabs,
  SegmentedControl,
  tabBarClass,
  tabListClass,
  tabClass,
  tabCountClass,
  type TabItem,
  type SegmentOption,
} from "./Tabs";

export {
  Dialog,
  ConfirmDialog,
  dialogFooterClass,
  type DialogSize,
} from "./Dialog";

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  PageSkeleton,
} from "./Skeleton";

export {
  Spinner,
  LoadingBlock,
  ErrorBlock,
  InlineError,
  InlineSuccess,
  EmptyState,
  PageHeader,
  KpiCard,
  StatCard,
  CardHeader,
  Card,
  SkillChips,
  type StatTone,
} from "./Feedback";

export {
  inputClass,
  selectClass,
  textareaClass,
  compactInputClass,
  labelClass,
  helpTextClass,
  errorTextClass,
  checkboxClass,
  primaryButtonClass,
  secondaryButtonClass,
  smallButtonClass,
  dangerButtonClass,
} from "./controls";

export {
  tableWrapClass,
  tableScrollClass,
  tableCardClass,
  tableClass,
  thClass,
  tdClass,
  trClass,
  numericCellClass,
  stackedListClass,
  stackedItemClass,
  listCardClass,
} from "./table";
