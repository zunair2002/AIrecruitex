"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type { OrgInterviewViolationType } from "@/lib/types";

/**
 * Browser-side proctoring for the organisational interview: the webcam
 * (`useCamera`) and focus/tab/full-screen monitoring (`useProctoringEvents`).
 *
 * The browser only *detects* — every violation is reported to the backend,
 * which counts them and cancels the interview on the third. A tampered client
 * can avoid reporting, but it can't un-cancel an interview.
 */

export type CameraState =
  | "idle"
  | "requesting"
  | "on"
  | "denied"
  | "unavailable"
  | "lost";

export const VIOLATION_LABELS: Record<OrgInterviewViolationType, string> = {
  tab_hidden: "You switched to another tab or minimised the window.",
  window_blur: "You moved focus away from the interview window.",
  fullscreen_exit: "You left full-screen mode.",
  camera_off: "Your camera turned off or lost permission.",
};

const cameraErrorMessage = (err: unknown): { state: CameraState; message: string } => {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return {
      state: "denied",
      message:
        "Camera access is blocked. Allow it from the camera icon in your browser's address bar, then try again.",
    };
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return { state: "unavailable", message: "No camera was found. Connect a webcam and try again." };
  }
  if (name === "NotReadableError" || name === "AbortError") {
    return {
      state: "unavailable",
      message: "Your camera is being used by another app. Close that app and try again.",
    };
  }
  return { state: "unavailable", message: "We couldn't start your camera. Please try again." };
};

/**
 * One webcam stream for the whole page (preview on the intro screen, thumbnail
 * during the interview). `state` drops to "lost" when the track ends — the
 * camera was unplugged, switched off, or its permission was revoked.
 */
export function useCamera({ onLost }: { onLost?: () => void } = {}) {
  const onLostRef = useRef(onLost);
  useEffect(() => {
    onLostRef.current = onLost;
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("idle");
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    streamRef.current = null;
    setStream(null);
    setState("idle");
  }, []);

  const markLost = useCallback(() => {
    stop();
    setState("lost");
    setError("Your camera turned off. Turn it back on to continue.");
    onLostRef.current?.();
  }, [stop]);

  const start = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("unavailable");
      setError(
        "This browser can't access a camera. Use a recent version of Chrome, Edge, Firefox or Safari.",
      );
      return false;
    }
    setState("requesting");
    setError(null);
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      stop();
      streamRef.current = next;
      next.getVideoTracks().forEach((track) => {
        track.onended = () => {
          if (streamRef.current === next) markLost();
        };
      });
      setStream(next);
      setState("on");
      return true;
    } catch (err) {
      const { state: nextState, message } = cameraErrorMessage(err);
      setState(nextState);
      setError(message);
      return false;
    }
  }, [markLost, stop]);

  // Belt and braces: not every browser fires `ended` when permission is
  // revoked mid-stream, so also poll the track and watch the permission.
  useEffect(() => {
    if (state !== "on") return;
    const id = window.setInterval(() => {
      const tracks = streamRef.current?.getVideoTracks() ?? [];
      if (tracks.length === 0 || tracks.every((t) => t.readyState === "ended")) markLost();
    }, 2000);

    let status: PermissionStatus | null = null;
    const onPermission = () => {
      if (status?.state === "denied") markLost();
    };
    navigator.permissions
      ?.query({ name: "camera" as PermissionName })
      .then((result) => {
        status = result;
        result.addEventListener("change", onPermission);
      })
      .catch(() => {
        // Firefox doesn't expose the camera permission — the poll covers it.
      });

    return () => {
      window.clearInterval(id);
      status?.removeEventListener("change", onPermission);
    };
  }, [state, markLost]);

  useEffect(() => stop, [stop]);

  return { stream, state, error, start, stop };
}

export type Camera = ReturnType<typeof useCamera>;

const DEDUPE_MS = 2000;

/**
 * Watches for the candidate leaving the interview while `active`: switching
 * tab / minimising (visibilitychange), focusing another window (blur), and
 * leaving full screen (only once full screen was actually entered). A tab
 * switch fires both blur and visibilitychange, so events within 2s collapse
 * into one report — the backend dedupes the same way.
 */
export function useProctoringEvents({
  active,
  fullscreenEntered,
  onViolation,
}: {
  active: boolean;
  fullscreenEntered: boolean;
  onViolation: (type: OrgInterviewViolationType) => void;
}) {
  const lastAt = useRef(0);
  const report = useEffectEvent((type: OrgInterviewViolationType) => {
    const now = Date.now();
    if (now - lastAt.current < DEDUPE_MS) return;
    lastAt.current = now;
    onViolation(type);
  });

  useEffect(() => {
    if (!active) return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") report("tab_hidden");
    };
    const onBlur = () => report("window_blur");
    const onFullscreen = () => {
      if (fullscreenEntered && !document.fullscreenElement) report("fullscreen_exit");
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [active, fullscreenEntered]);
}

/** Requests full screen; resolves false where unsupported (e.g. iPhone Safari) or refused. */
export async function enterFullscreen(): Promise<boolean> {
  const el = document.documentElement;
  if (!el.requestFullscreen || !document.fullscreenEnabled) return false;
  if (document.fullscreenElement) return true;
  try {
    await el.requestFullscreen({ navigationUI: "hide" });
    return true;
  } catch {
    return false;
  }
}

export function exitFullscreen() {
  if (typeof document !== "undefined" && document.fullscreenElement) {
    void document.exitFullscreen().catch(() => undefined);
  }
}
