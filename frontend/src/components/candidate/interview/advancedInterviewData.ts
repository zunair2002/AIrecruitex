export type AdvancedQuestion = {
  id: string;
  title: string;
  prompt: string;
  tip: string;
};

export type InterviewTrack = {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  questions: AdvancedQuestion[];
};

export const advancedTracks: InterviewTrack[] = [
  {
    id: "react",
    title: "React Developer",
    description: "Frontend fundamentals, hooks, and performance.",
    icon: "⚛️",
    gradient: "from-sky-500 to-blue-600",
    questions: [
      {
        id: "react-1",
        title: "Virtual DOM",
        prompt: "Explain the Virtual DOM and how React uses it to update the UI efficiently.",
        tip: "Compare with direct DOM manipulation and mention reconciliation.",
      },
      {
        id: "react-2",
        title: "React Hooks",
        prompt: "What is the difference between useState and useEffect? When would you use each?",
        tip: "Give a short real-world example for state vs side effects.",
      },
      {
        id: "react-3",
        title: "Performance",
        prompt: "How do you optimize performance in a React application?",
        tip: "Mention memoization, code splitting, lazy loading, and list keys.",
      },
    ],
  },
  {
    id: "node",
    title: "Node Developer",
    description: "Backend APIs, async patterns, and server design.",
    icon: "🟢",
    gradient: "from-emerald-500 to-green-600",
    questions: [
      {
        id: "node-1",
        title: "Event Loop",
        prompt: "Explain the Node.js event loop and how it handles asynchronous operations.",
        tip: "Cover call stack, callback queue, and non-blocking I/O.",
      },
      {
        id: "node-2",
        title: "Express Middleware",
        prompt: "What is middleware in Express? Describe a use case you have implemented.",
        tip: "Examples: auth, logging, error handling, or request parsing.",
      },
      {
        id: "node-3",
        title: "Async Error Handling",
        prompt: "How do you handle errors in async Node.js code?",
        tip: "Discuss try/catch, async/await, and centralized error middleware.",
      },
    ],
  },
  {
    id: "ai",
    title: "AI Engineer",
    description: "ML concepts, models, and production readiness.",
    icon: "🤖",
    gradient: "from-violet-500 to-purple-600",
    questions: [
      {
        id: "ai-1",
        title: "ML Basics",
        prompt: "What is the difference between supervised and unsupervised learning?",
        tip: "Give one example algorithm or use case for each type.",
      },
      {
        id: "ai-2",
        title: "Neural Networks",
        prompt: "Explain what a neural network is and where you would use one.",
        tip: "Keep it simple: layers, weights, and a practical application.",
      },
      {
        id: "ai-3",
        title: "Model Deployment",
        prompt: "How would you approach deploying an ML model to production?",
        tip: "Mention API serving, monitoring, retraining, and data drift.",
      },
    ],
  },
];
