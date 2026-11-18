"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useSyncExternalStore,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button, IconButton } from "./Button";

/**
 * Accessible modal dialog: role="dialog", aria-modal, labelled by its title,
 * focus moved into the panel (and restored on close), Tab kept inside, Escape
 * and backdrop click close it, page scroll locked while open. Rendered in a
 * portal on document.body, so transformed parents can't trap it.
 *
 *   <Dialog
 *     open={isOpen}
 *     onClose={() => setIsOpen(false)}
 *     title="Schedule AI interview"
 *     description="Ali Raza · Backend Developer"
 *     onSubmit={handleSubmit}               // optional: wraps body + footer in a <form>
 *     footer={
 *       <>
 *         <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
 *         <Button type="submit" loading={isSaving}>Schedule</Button>
 *       </>
 *     }
 *   >
 *     …fields…
 *   </Dialog>
 */

export type DialogSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<DialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true once mounted in the browser. */
function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Footer row: actions right-aligned; stacked full-width on phones. */
export const dialogFooterClass =
  "flex shrink-0 flex-col-reverse gap-3 border-t border-line-soft bg-surface-2/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6 [&>*]:w-full sm:[&>*]:w-auto";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  onSubmit,
  size = "md",
  initialFocusRef,
  dismissible = true,
  hideCloseButton = false,
  ariaLabel,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Action buttons, rendered in the footer bar. */
  footer?: ReactNode;
  /** When set, body and footer are wrapped in a <form> with this handler. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  size?: DialogSize;
  /** Element to focus on open (defaults to the panel itself). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Set false while saving to block Escape / backdrop close. */
  dismissible?: boolean;
  hideCloseButton?: boolean;
  /** Accessible name when there is no visible `title`. */
  ariaLabel?: string;
  className?: string;
}) {
  const isClient = useIsClient();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Event handlers close through this; the keydown effect uses the
  // effect-event twin so it never re-subscribes when `onClose` changes.
  const handleClose = () => {
    if (dismissible) onClose();
  };
  const closeFromEffect = useEffectEvent(() => {
    if (dismissible) onClose();
  });

  useEffect(() => {
    if (!open || !isClient) return;
    const panel = panelRef.current;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    (initialFocusRef?.current ?? panel)?.focus({ preventScroll: true });

    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeFromEffect();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [open, isClient, initialFocusRef]);

  if (!open || !isClient) return null;

  const closeOnBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) handleClose();
  };

  const hasHeader = Boolean(title) || !hideCloseButton;
  const hasBody =
    children !== undefined && children !== null && children !== false;

  const body = (
    <>
      {hasBody && (
        <div
          className={`min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6 ${
            hasHeader ? "pt-4" : "pt-5 sm:pt-6"
          }`}
        >
          {children}
        </div>
      )}
      {footer && <div className={dialogFooterClass}>{footer}</div>}
    </>
  );

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm motion-safe:animate-fade-in"
      />
      <div
        className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4"
        onMouseDown={closeOnBackdrop}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title ? undefined : ariaLabel}
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          className={`relative flex max-h-[90dvh] w-full ${SIZES[size]} flex-col overflow-hidden rounded-2xl bg-white shadow-xl outline-none motion-safe:animate-dialog-in ${className}`}
        >
          {hasHeader && (
            <div
              className={`flex shrink-0 items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6 ${
                hasBody ? "" : "pb-5 sm:pb-6"
              }`}
            >
              <div className="min-w-0">
                {title && (
                  <h2
                    id={titleId}
                    className="font-display text-lg font-semibold tracking-tight text-ink"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="mt-1 text-sm text-muted">
                    {description}
                  </p>
                )}
              </div>
              {!hideCloseButton && (
                <IconButton
                  label="Close dialog"
                  size="sm"
                  onClick={handleClose}
                  disabled={!dismissible}
                  className="-mr-2 -mt-1 text-muted"
                >
                  <X aria-hidden="true" />
                </IconButton>
              )}
            </div>
          )}

          {onSubmit ? (
            <form
              onSubmit={onSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              {body}
            </form>
          ) : (
            body
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Yes/no confirmation built on Dialog.
 *
 *   <ConfirmDialog
 *     open={pending !== null}
 *     tone="danger"
 *     title="Delete this user?"
 *     description="This can't be undone."
 *     confirmLabel="Delete user"
 *     loading={isDeleting}
 *     onConfirm={handleDelete}
 *     onClose={() => setPending(null)}
 *   />
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  loading = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      dismissible={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
