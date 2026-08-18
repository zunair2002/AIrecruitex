export type LearningRecommendation = {
  id: string;
  skill: string;
  title: string;
  description: string;
  type: "Course" | "Video" | "Article" | "Practice";
  priority: "High" | "Medium" | "Low";
  duration: string;
  progress: number;
  source: string;
};

export const learningRecommendations: LearningRecommendation[] = [
  {
    id: "react-hooks",
    skill: "React Hooks",
    title: "Master useEffect & useMemo",
    description: "Based on your React interview score, strengthen hook patterns and dependency arrays.",
    type: "Course",
    priority: "High",
    duration: "4 hours",
    progress: 0,
    source: "AIRecruitX Learning",
  },
  {
    id: "star-method",
    skill: "Communication",
    title: "STAR Method for Interviews",
    description: "Structure behavioral answers with Situation, Task, Action, and Result.",
    type: "Video",
    priority: "High",
    duration: "25 min",
    progress: 40,
    source: "Career Skills Hub",
  },
  {
    id: "node-event-loop",
    skill: "Node.js",
    title: "Event Loop Deep Dive",
    description: "Improve technical explanations for async patterns and non-blocking I/O.",
    type: "Article",
    priority: "Medium",
    duration: "15 min",
    progress: 0,
    source: "Dev Docs",
  },
  {
    id: "system-design",
    skill: "System Design",
    title: "Scalability Basics",
    description: "Learn load balancing, caching, and database scaling fundamentals.",
    type: "Course",
    priority: "Medium",
    duration: "6 hours",
    progress: 15,
    source: "AIRecruitX Learning",
  },
  {
    id: "confidence",
    skill: "Confidence",
    title: "Mock Interview Drills",
    description: "Daily 10-minute speaking exercises to build interview confidence.",
    type: "Practice",
    priority: "Medium",
    duration: "10 min/day",
    progress: 60,
    source: "AIRecruitX Practice",
  },
  {
    id: "ml-basics",
    skill: "AI / ML",
    title: "ML Fundamentals Refresher",
    description: "Review supervised vs unsupervised learning before your next AI Engineer track.",
    type: "Video",
    priority: "Low",
    duration: "45 min",
    progress: 0,
    source: "AI Learning Lab",
  },
];

export const priorityStyles = {
  High: "bg-red-50 text-red-700 border-red-100",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  Low: "bg-gray-50 text-gray-600 border-gray-100",
};

export const typeIcons: Record<LearningRecommendation["type"], string> = {
  Course: "📘",
  Video: "🎬",
  Article: "📰",
  Practice: "🎯",
};
