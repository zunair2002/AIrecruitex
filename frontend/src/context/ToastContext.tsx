"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

export type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  tone: ToastTone;
  title: string;
  detail?: string;
};

type ToastContextValue = {
  /** Shows a toast. Returns its id so it can be dismissed early. */
  toast: (input: { tone?: ToastTone; title: string; detail?: string }) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4500;

/**
 * App-wide toasts: white card with a tone icon, bottom-right on desktop and
 * full-width along the bottom on phones.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    ({ tone = "success", title, detail }) => {
      // Date.now() can collide inside one tick; the random suffix keeps keys unique.
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, tone, title, detail }]);
      return id;
    },
    [],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col gap-3 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icon =
    toast.tone === "success" ? (
      <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
    ) : toast.tone === "error" ? (
      <TriangleAlert aria-hidden="true" className="h-5 w-5" />
    ) : (
      <Info aria-hidden="true" className="h-5 w-5" />
    );

  const iconTone =
    toast.tone === "success"
      ? "bg-brand-50 text-brand-600"
      : toast.tone === "error"
        ? "bg-rose-50 text-rose-600"
        : "bg-brand-50 text-brand-700";

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white p-4 shadow-lg motion-safe:animate-toast-in"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconTone}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.detail && (
          <p className="mt-1 break-words text-sm text-muted">{toast.detail}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="-m-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a <ToastProvider>");
  }
  return context;
}
