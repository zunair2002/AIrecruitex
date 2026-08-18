export type InterviewReport = {
  id: string;
  candidateName: string;
  jobTitle: string;
  interviewDate: string;
  communication: number;
  technical: number;
  confidence: number;
  finalScore: number;
  feedback: string;
};

export const interviewReports: InterviewReport[] = [
  {
    id: "r1",
    candidateName: "Sarah Khan",
    jobTitle: "React Developer",
    interviewDate: "Mar 21, 2026",
    communication: 88,
    technical: 85,
    confidence: 80,
    finalScore: 84,
    feedback:
      "Strong React fundamentals and clear communication. Recommend moving to shortlist after technical round review.",
  },
  {
    id: "r2",
    candidateName: "Ali Ahmed",
    jobTitle: "Node.js Backend Engineer",
    interviewDate: "Mar 20, 2026",
    communication: 82,
    technical: 86,
    confidence: 78,
    finalScore: 83,
    feedback:
      "Excellent backend knowledge. Event loop explanation was solid. Good fit for the Node.js role.",
  },
  {
    id: "r3",
    candidateName: "Hassan Raza",
    jobTitle: "AI Engineer",
    interviewDate: "Mar 19, 2026",
    communication: 79,
    technical: 92,
    confidence: 75,
    finalScore: 86,
    feedback:
      "Outstanding ML and neural network answers. Slightly hesitant on deployment topics — still a strong candidate.",
  },
  {
    id: "r4",
    candidateName: "Jane Doe",
    jobTitle: "React Developer",
    interviewDate: "Mar 18, 2026",
    communication: 74,
    technical: 70,
    confidence: 72,
    finalScore: 72,
    feedback:
      "Adequate React knowledge. Needs improvement on hooks and performance optimization before shortlisting.",
  },
];

export function getFinalScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 bg-emerald-50";
  if (score >= 65) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}
