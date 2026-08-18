"use client";

import { useState } from "react";
import { morePills } from "./morePillsData";

export const MoreFeaturesToggle = () => {
  const [showMore, setShowMore] = useState(false);
  const [openPill, setOpenPill] = useState<number | null>(null);

  return (
    <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
      <button
        onClick={() => setShowMore((s) => !s)}
        className="more-toggle-btn"
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 24px", borderRadius: "24px",
          border: "1.5px solid #e2e8f0", background: "#fff",
          fontSize: "14px", fontWeight: 600, color: "#475569",
          cursor: "pointer",
        }}
      >
        <span>{showMore ? "Hide features" : "See more features"}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showMore ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {showMore && (
        <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
          {morePills.map((pill, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column" }}>
              <div
                className="feat-pill-item"
                onClick={() => setOpenPill(openPill === i ? null : i)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 16px", borderRadius: "24px",
                  border: openPill === i ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
                  background: openPill === i ? "#e0e7ff" : "#fff",
                  fontSize: "13px", fontWeight: 600,
                  color: openPill === i ? "#4f46e5" : "#374151",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {pill.icon}
                </svg>
                {pill.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openPill === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", marginLeft: "2px" }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              {openPill === i && (
                <div style={{
                  marginTop: "6px",
                  padding: "10px 14px",
                  background: "#f0f4ff",
                  border: "1.5px solid #c7d2fe",
                  borderRadius: "12px",
                  fontSize: "12px", color: "#475569", lineHeight: 1.6,
                  maxWidth: "260px",
                }}>
                  {pill.desc}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
