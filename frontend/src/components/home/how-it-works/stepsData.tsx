export type HowItWorksStep = {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
};

export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: 1,
    title: "Post Your Job",
    description:
      "Paste your job description and set your interview mode. Skreena generates tailored questions automatically.",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </>
    ),
  },
  {
    number: 2,
    title: "AI Interviews",
    description:
      "Candidates apply and Skreena interviews them automatically — any time, any timezone, no scheduling needed.",
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>,
  },
  {
    number: 3,
    title: "Review Shortlist",
    description:
      "Wake up to scored, ranked candidates ready for review. Only spend time on the best fits.",
    icon: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </>
    ),
  },
];
