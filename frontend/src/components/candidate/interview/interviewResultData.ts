export type InterviewResultItem = {
  id: string;
  title: string;
  type: "Basic" | "Advanced";
  date: string;
  communication: number;
  technical: number;
  confidence: number;
  finalScore: number;
  feedback: string;
};

export const interviewResults: InterviewResultItem[] = [
  {
    id: "react-adv",
    title: "React Developer",
    type: "Advanced",
    date: "Mar 20, 2026",
    communication: 85,
    technical: 82,
    confidence: 78,
    finalScore: 82,
    feedback:
      "Strong understanding of React fundamentals. Improve confidence when explaining performance optimizations with more concrete examples.",
  },
  {
    id: "basic-practice",
    title: "Basic Practice",
    type: "Basic",
    date: "Mar 18, 2026",
    communication: 74,
    technical: 68,
    confidence: 72,
    finalScore: 71,
    feedback:
      "Good self-introduction. Work on structuring weakness answers with a clear improvement plan and measurable goals.",
  },
  {
    id: "node-adv",
    title: "Node Developer",
    type: "Advanced",
    date: "Mar 15, 2026",
    communication: 80,
    technical: 76,
    confidence: 70,
    finalScore: 75,
    feedback:
      "Solid backend knowledge. Practice explaining the event loop more concisely and add real project examples for middleware.",
  },
];

export const scoreCategories = [
  { key: "communication" as const, label: "Communication", color: "from-sky-500 to-blue-600" },
  { key: "technical" as const, label: "Technical", color: "from-indigo-500 to-indigo-600" },
  { key: "confidence" as const, label: "Confidence", color: "from-purple-500 to-purple-600" },
];
