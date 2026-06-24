import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "About | AIRecruitX",
  description: "Learn about AIRecruitX - Virtual Interview Platform for candidates and HR teams",
};

export default function AboutPage() {
  return (
    <main>
      <section className="pt-32 pb-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About AIRecruitX</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            AIRecruitX is a Virtual Interview Platform that connects job seekers with companies
            through AI-powered interviews, resume matching, and intelligent hiring tools.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We make hiring fair, fast, and accessible. Candidates get AI coaching to improve their
              interview skills, while HR teams automate screening and find the best talent without
              spending hours on manual resume reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-indigo-50 border border-indigo-100">
              <h3 className="text-xl font-bold text-indigo-900 mb-3">For Candidates</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Practice interviews, upload your resume, get AI feedback, learning recommendations,
                and career guidance — all in one platform.
              </p>
              <Link href="/login/candidate" className="inline-block mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                Join as Candidate →
              </Link>
            </div>
            <div className="p-8 rounded-2xl bg-purple-50 border border-purple-100">
              <h3 className="text-xl font-bold text-purple-900 mb-3">For HR Teams</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create jobs, receive applications, match resumes with AI, review interview reports,
                and shortlist the best candidates effortlessly.
              </p>
              <Link href="/login/recruiter" className="inline-block mt-4 text-sm font-semibold text-purple-600 hover:text-purple-500">
                Join as HR →
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
            <ol className="space-y-4 text-gray-600">
              <li className="flex gap-3"><span className="font-bold text-indigo-600">1.</span> Candidates upload resumes and practice AI interviews.</li>
              <li className="flex gap-3"><span className="font-bold text-indigo-600">2.</span> HR posts jobs with required skills and experience.</li>
              <li className="flex gap-3"><span className="font-bold text-indigo-600">3.</span> AI matches resumes to jobs and conducts interviews.</li>
              <li className="flex gap-3"><span className="font-bold text-indigo-600">4.</span> HR reviews scores and shortlists top candidates.</li>
            </ol>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
