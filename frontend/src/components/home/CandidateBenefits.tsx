const benefits = [
  {
    icon: "🎯",
    title: "Practice Interviews",
    description: "Basic and advanced AI interviews to prepare for real job applications.",
  },
  {
    icon: "📄",
    title: "Resume Upload",
    description: "Upload your PDF resume and get matched with relevant job opportunities.",
  },
  {
    icon: "📊",
    title: "AI Feedback & Scoring",
    description: "Get scores on communication, technical skills, and confidence after every interview.",
  },
  {
    icon: "📚",
    title: "Learning Recommendations",
    description: "AI suggests videos and resources based on your weak areas.",
  },
  {
    icon: "💬",
    title: "Career Guidance",
    description: "Chat with an AI assistant for personalized career advice anytime.",
  },
  {
    icon: "📈",
    title: "Track Progress",
    description: "Dashboard shows your interview history, average score, and improvements.",
  },
];

export const CandidateBenefits = () => (
  <section className="py-20 bg-white" id="candidate-benefits">
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">For Job Seekers</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Candidate Benefits</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Everything you need to practice, improve, and land your dream job with AI-powered coaching.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((item) => (
          <div
            key={item.title}
            className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:shadow-md hover:border-indigo-100 transition-all"
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
