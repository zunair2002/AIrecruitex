"use client";

import { animatedScenes } from "./scenesConfig";

type FeaturesCarouselCardProps = {
  activeScene: number;
  onSelectScene: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export const FeaturesCarouselCard = ({
  activeScene,
  onSelectScene,
  onPrev,
  onNext,
}: FeaturesCarouselCardProps) => (
  <div className="feat-scene-card" style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0",
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,.06)",
  }}>
    <div style={{
      background: "linear-gradient(135deg,#f0f4ff 0%,#f5f0ff 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "260px",
      padding: "40px 24px",
      borderRight: "1.5px solid #e2e8f0",
    }}>
      {animatedScenes[activeScene].visual}
    </div>

    <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        {animatedScenes.map((_, i) => (
          <button
            key={i}
            onClick={() => onSelectScene(i)}
            style={{
              fontSize: "12px", fontWeight: 600,
              padding: "4px 12px", borderRadius: "20px",
              border: i === activeScene ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
              background: i === activeScene ? "#6366f1" : "#fff",
              color: i === activeScene ? "#fff" : "#64748b",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          {animatedScenes[activeScene].title}
        </h3>
      </div>

      <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.7, margin: 0 }}>
        {animatedScenes[activeScene].desc}
      </p>

      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <button onClick={onPrev} className="nav-arrow-btn" aria-label="Previous" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button onClick={onNext} className="nav-arrow-btn" aria-label="Next" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "4px" }}>
          {animatedScenes.map((_, i) => (
            <button key={i} onClick={() => onSelectScene(i)} className="nav-dot-btn" style={{ width: i === activeScene ? "20px" : "8px", height: "8px", borderRadius: "4px", border: "none", background: i === activeScene ? "#6366f1" : "#e2e8f0", cursor: "pointer", transition: "all 0.2s", padding: 0 }} />
          ))}
        </div>
      </div>
    </div>
  </div>
);
