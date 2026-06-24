"use client";

import { useState } from "react";
import { animatedScenes } from "./scenesConfig";
import { FeaturesAnimatedStyles } from "./FeaturesAnimatedStyles";
import { FeaturesCarouselCard } from "./FeaturesCarouselCard";
import { MoreFeaturesToggle } from "./MoreFeaturesToggle";

export function FeaturesAnimated() {
  const [activeScene, setActiveScene] = useState(0);

  const prev = () => setActiveScene((s) => (s === 0 ? animatedScenes.length - 1 : s - 1));
  const next = () => setActiveScene((s) => (s === animatedScenes.length - 1 ? 0 : s + 1));

  return (
    <section id="features" style={{ background: "#f8fafc", padding: "80px 0", fontFamily: "Inter, system-ui, sans-serif" }}>
      <FeaturesAnimatedStyles />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#6366f1", marginBottom: "8px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            ✦ Powerful Features
          </p>
          <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.15, margin: 0 }}>
            Everything you need to screen<br />candidates efficiently.
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          <FeaturesCarouselCard
            activeScene={activeScene}
            onSelectScene={setActiveScene}
            onPrev={prev}
            onNext={next}
          />
        </div>

        <MoreFeaturesToggle />
      </div>
    </section>
  );
}
