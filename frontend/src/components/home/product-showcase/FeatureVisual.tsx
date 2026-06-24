import { BrandBrandingVisual, AIHumanVisual } from "./visuals/brandingAndAi";
import { AutopilotVisual, SmartScoringVisual } from "./visuals/autopilotAndScoring";
import { DiscrepancyVisual, AntiCheatVisual } from "./visuals/discrepancyAndAntiCheat";
import {
  CVParsingVisual,
  CandidateInsightsVisual,
  EmailNotificationsVisual,
} from "./visuals/cvAndInsights";

export const FeatureVisual = ({ id }: { id: number }) => {
  switch (id) {
    case 1:
      return <BrandBrandingVisual />;
    case 2:
      return <AIHumanVisual />;
    case 3:
      return <AutopilotVisual />;
    case 4:
      return <SmartScoringVisual />;
    case 5:
      return <DiscrepancyVisual />;
    case 6:
      return <AntiCheatVisual />;
    case 7:
      return <CVParsingVisual />;
    case 8:
      return <CandidateInsightsVisual />;
    case 9:
      return <EmailNotificationsVisual />;
    default:
      return null;
  }
};
