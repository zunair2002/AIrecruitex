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
 * App-wide toasts, styled to match the dashboards: flat white card, hairline
 * border, small uppercase-free type, brand purple accents.
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
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,340px)] flex-col gap-2"
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
      <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-emerald-600" />
    ) : toast.tone === "error" ? (
      <TriangleAlert aria-hidden="true" className="h-4 w-4 text-rose-600" />
    ) : (
      <Info aria-hidden="true" className="h-4 w-4 text-brand" />
    );

  const iconBg =
    toast.tone === "success"
      ? "bg-emerald-50"
      : toast.tone === "error"
        ? "bg-rose-50"
        : "bg-brand-light";

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-start gap-2.5 border border-[#e9eaf0] bg-white p-3 shadow-[0_6px_24px_rgba(26,8,51,0.10)]"
    >
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${iconBg}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-[#292b35]">{toast.title}</p>
        {toast.detail && (
          <p className="mt-0.5 text-[11px] leading-4 text-[#686b77]">
            {toast.detail}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 text-[#b6b8c2] transition-colors hover:text-[#292b35]"
      >
        <X aria-hidden="true" className="h-3.5 w-3.5" />
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
