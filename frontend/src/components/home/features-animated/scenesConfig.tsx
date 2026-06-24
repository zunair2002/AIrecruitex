"use client";

import { SceneTwoStage } from "./scenes/SceneTwoStage";
import { Scene247 } from "./scenes/Scene247";
import { SceneSmartScoring } from "./scenes/SceneSmartScoring";
import { SceneDiscrepancy } from "./scenes/SceneDiscrepancy";

export const animatedScenes = [
  {
    visual: <SceneTwoStage />,
    title: "Two-Stage Screening",
    desc: "Quick CV filter first, deep interviews only for promising candidates. Save credits and time by eliminating poor fits early in the process.",
  },
  {
    visual: <Scene247 />,
    title: "24/7 AI Interviews",
    desc: "Candidates interview on their schedule — no diary juggling or timezone coordination. Multiple interviews run in parallel, anywhere in the world, 24/7.",
  },
  {
    visual: <SceneSmartScoring />,
    title: "Smart Scoring",
    desc: "Dual-agent AI consensus ensures accurate, unbiased match scores. Two AI reviewers independently evaluate each candidate, then reconcile for fair, reliable rankings.",
  },
  {
    visual: <SceneDiscrepancy />,
    title: "Discrepancy Detection",
    desc: "AI flags mismatches between CV claims and interview answers. Catch embellishments automatically before they become costly hiring mistakes.",
  },
];
