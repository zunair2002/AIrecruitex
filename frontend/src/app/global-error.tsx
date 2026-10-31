"use client";

import { useEffect } from "react";

/**
 * Last line of defence: an error thrown in the root layout itself, where the
 * normal error boundary can't render because the layout never mounted. It must
 * supply its own <html>/<body>, and can't rely on app styles loading.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            padding: 32,
            borderRadius: 16,
            background: "#fff",
            border: "1px solid #f3f4f6",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            AiRecruitex is temporarily unavailable
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280" }}>
            Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              background: "#4a148c",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
