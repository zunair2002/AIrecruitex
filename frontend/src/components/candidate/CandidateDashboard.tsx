const stats = [
  {
    label: "Total Interviews",
    value: "12",
    sub: "+3 this month",
    icon: "🎤",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    label: "Average Score",
    value: "78%",
    sub: "+5% from last month",
    icon: "⭐",
    color: "from-purple-500 to-purple-600",
  },
  {
    label: "Recommendations",
    value: "5",
    sub: "Skills to improve",
    icon: "📚",
    color: "from-emerald-500 to-emerald-600",
  },
];

const recentInterviews = [
  { role: "React Developer", type: "Advanced", score: 82, date: "Mar 20, 2026" },
  { role: "Basic Practice", type: "Basic", score: 71, date: "Mar 18, 2026" },
  { role: "Node Developer", type: "Advanced", score: 75, date: "Mar 15, 2026" },
];

const recommendations = [
  { skill: "React Hooks", resource: "Master useEffect & useMemo", priority: "High" },
  { skill: "System Design", resource: "Scalability basics course", priority: "Medium" },
  { skill: "Communication", resource: "STAR method practice", priority: "Medium" },
];

export function CandidateDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s your interview progress overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shadow-sm`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-xs text-indigo-600 mt-1 font-medium">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Interviews</h2>
          <div className="space-y-3">
            {recentInterviews.map((interview) => (
              <div
                key={interview.date + interview.role}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{interview.role}</p>
                  <p className="text-xs text-gray-500">{interview.type} · {interview.date}</p>
                </div>
                <span className="text-lg font-bold text-indigo-600">{interview.score}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">AI Recommendations</h2>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.skill}
                className="p-4 rounded-xl bg-indigo-50 border border-indigo-100"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-indigo-900 text-sm">{rec.skill}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-white px-2 py-0.5 rounded-full">
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-indigo-700">{rec.resource}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
