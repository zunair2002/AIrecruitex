"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useServerEvent } from "@/context/RealtimeContext";
import { useToast } from "@/context/ToastContext";
import { APPLICATION_STATUS_LABELS, formatDateTime } from "@/lib/format";

/**
 * Turns the backend's push events into toasts, so a candidate sees an HR
 * decision the moment it happens rather than only on their next page load.
 *
 * Note: the backend emits these three application events over the socket but
 * does NOT write a Notification record for them, so they are live-only — if the
 * candidate is offline when HR acts, there is nothing to catch up on.
 */
export function RealtimeToasts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useServerEvent("application:status", (payload) => {
    const label = APPLICATION_STATUS_LABELS[payload.status] ?? payload.status;
    toast({
      tone: payload.status === "selected" ? "success" : "info",
      title: `Application ${label.toLowerCase()}`,
      detail:
        payload.status === "selected"
          ? "An employer moved you forward. Open My Applications for details."
          : "An employer updated your application status.",
    });
    router.refresh();
  });

  useServerEvent("application:ai-interview-scheduled", (payload) => {
    toast({
      tone: "success",
      title: "AI interview scheduled",
      detail: payload.aiInterview?.dateTime
        ? formatDateTime(payload.aiInterview.dateTime)
        : "Open My Applications to start it.",
    });
    router.refresh();
  });

  useServerEvent("application:org-interview", () => {
    toast({
      tone: "success",
      title: "Interview invite sent to you",
      detail: "Check your email for the interview link.",
    });
    router.refresh();
  });

  // Admin broadcasts and support replies — these DO have a saved notification.
  useServerEvent("admin:notification", (payload) => {
    toast({
      tone: "info",
      title: "New notification",
      detail: payload.message,
    });
  });

  // Rendered for its effects only; it must sit inside the realtime provider.
  if (!user) return null;
  return null;
}
