export type BasicQuestion = {
  id: string;
  title: string;
  prompt: string;
  tip: string;
};

export const basicQuestions: BasicQuestion[] = [
  {
    id: "introduce",
    title: "Introduce Yourself",
    prompt: "Tell us about yourself, your background, and what you are looking for in your next role.",
    tip: "Keep it under 2 minutes. Focus on education, experience, and career goals.",
  },
  {
    id: "strengths",
    title: "Your Strengths",
    prompt: "What are your key strengths? Share examples that show how you have used them at work or in projects.",
    tip: "Use the STAR method: Situation, Task, Action, Result.",
  },
  {
    id: "weaknesses",
    title: "Your Weaknesses",
    prompt: "What is an area you are working to improve? Explain how you are actively addressing it.",
    tip: "Pick a real weakness and show self-awareness plus a clear improvement plan.",
  },
];
