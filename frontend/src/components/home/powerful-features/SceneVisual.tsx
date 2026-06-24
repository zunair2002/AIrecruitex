"use client";

import { TwoStageVisual } from "./scene-visuals/TwoStageVisual";
import { TwentyFourSevenVisual } from "./scene-visuals/TwentyFourSevenVisual";
import { SmartScoringSceneVisual } from "./scene-visuals/SmartScoringSceneVisual";
import { DiscrepancySceneVisual } from "./scene-visuals/DiscrepancySceneVisual";

export const SceneVisual = ({ sceneId }: { sceneId: number }) => {
  switch (sceneId) {
    case 0:
      return <TwoStageVisual />;
    case 1:
      return <TwentyFourSevenVisual />;
    case 2:
      return <SmartScoringSceneVisual />;
    case 3:
      return <DiscrepancySceneVisual />;
    default:
      return null;
  }
};
