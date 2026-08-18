const benefits = [
  {
    icon: "📋",
    title: "Create Job Posts",
    description: "Post jobs with title, description, required skills, and experience level.",
  },
  {
    icon: "🔍",
    title: "AI Resume Matching",
    description: "Automatically compare candidate resumes against job requirements with match scores.",
  },
  {
    icon: "🤖",
    title: "AI Interviews",
    description: "AI conducts technical and HR interviews so your team saves hours of screening time.",
  },
  {
    icon: "📑",
    title: "Interview Reports",
    description: "View detailed AI evaluation reports with confidence, communication, and technical scores.",
  },
  {
    icon: "⭐",
    title: "Shortlist Candidates",
    description: "Quickly identify and shortlist the best candidates from your applicant pool.",
  },
  {
    icon: "📊",
    title: "HR Dashboard",
    description: "Track total jobs, applicants, and selected candidates all in one place.",
  },
];

export const HRBenefits = () => (
  <section className="py-20 bg-gray-50" id="hr-benefits">
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">For Companies</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">HR Benefits</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Hire faster and smarter with AI-powered resume screening, interviews, and candidate evaluation.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((item) => (
          <div
            key={item.title}
            className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all"
          >
            <div className="text-3xl mb-4">{item.icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
