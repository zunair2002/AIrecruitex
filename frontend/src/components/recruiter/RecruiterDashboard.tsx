const stats = [
  {
    label: "Total Jobs",
    value: "8",
    sub: "+2 this month",
    icon: "💼",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    label: "Applicants",
    value: "124",
    sub: "+18 this week",
    icon: "👥",
    color: "from-purple-500 to-purple-600",
  },
  {
    label: "Selected Candidates",
    value: "12",
    sub: "3 pending offers",
    icon: "⭐",
    color: "from-emerald-500 to-emerald-600",
  },
];

const recentJobs = [
  { title: "React Developer", applicants: 34, status: "Active", date: "Mar 18, 2026" },
  { title: "Node.js Backend Engineer", applicants: 28, status: "Active", date: "Mar 15, 2026" },
  { title: "AI Engineer", applicants: 19, status: "Closed", date: "Mar 10, 2026" },
];

const recentApplicants = [
  { name: "Sarah Khan", role: "React Developer", match: 88, status: "Interviewed" },
  { name: "Ali Ahmed", role: "Node.js Backend Engineer", match: 82, status: "Shortlisted" },
  { name: "Jane Doe", role: "React Developer", match: 76, status: "Applied" },
];

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Closed: "bg-gray-100 text-gray-600",
  Applied: "bg-blue-50 text-blue-700",
  Interviewed: "bg-purple-50 text-purple-700",
  Shortlisted: "bg-indigo-50 text-indigo-700",
};

export function RecruiterDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here&apos;s an overview of your hiring pipeline.
        </p>
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Job Postings</h2>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.title + job.date}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
                  <p className="text-xs text-gray-500">
                    {job.applicants} applicants · {job.date}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${statusStyles[job.status]}`}
                >
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Applicants</h2>
          <div className="space-y-3">
            {recentApplicants.map((applicant) => (
              <div
                key={applicant.name + applicant.role}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{applicant.name}</p>
                  <p className="text-xs text-gray-500">{applicant.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600">{applicant.match}% match</p>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyles[applicant.status]}`}
                  >
                    {applicant.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
