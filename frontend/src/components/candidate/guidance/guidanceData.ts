export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export const quickPrompts = [
  "What career path suits me?",
  "How do I improve my interview score?",
  "Which skills should I learn next?",
  "How do I switch to a tech role?",
];

export const mockResponses: Record<string, string> = {
  "what career path suits me?":
    "Based on your practice interviews, you show strength in frontend (React) and solid communication. Consider roles like Frontend Developer or Full Stack Engineer. Take the Advanced Node track to broaden your profile.",
  "how do i improve my interview score?":
    "Focus on three areas: structure answers with STAR method, practice technical explanations out loud, and review your Interview Result feedback. I recommend starting with the Communication and React Hooks learning modules.",
  "which skills should i learn next?":
    "Your highest-priority gaps are React Hooks and interview communication. After those, explore System Design basics and Node.js event loop concepts to strengthen your full-stack readiness.",
  "how do i switch to a tech role?":
    "Build a portfolio with 2-3 solid projects, upload your resume here, and practice both Basic and Advanced interviews weekly. Target junior roles and highlight transferable skills from your current background.",
};

export const defaultWelcome =
  "Hi! I am your AI Career Guide. Ask me about career paths, skill gaps, interview prep, or switching into tech. Pick a suggestion below or type your own question.";

export function getMockReply(input: string): string {
  const key = input.trim().toLowerCase();
  if (mockResponses[key]) return mockResponses[key];

  for (const [prompt, reply] of Object.entries(mockResponses)) {
    if (key.includes(prompt.slice(0, 20)) || prompt.includes(key.slice(0, 20))) {
      return reply;
    }
  }

  return "Great question! Based on your interview history, keep practicing technical tracks and review your Learning Recommendations. For detailed advice, try asking about career paths, interview scores, or skills to learn next.";
}
