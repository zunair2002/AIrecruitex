import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "About | AiRecruitex",
  description:
    "Learn about AiRecruitex - Virtual Interview Platform for candidates and HR teams",
};

export default function AboutPage() {
  return (
    <main>
      <section className="bg-[#f6f3f9] pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="eyebrow">About</p>
          <h1 className="font-display mt-5 text-5xl text-ink md:text-6xl">
            Built for hiring that has to stand up to scrutiny.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#6b5f7a]">
            AiRecruitex connects job seekers and companies through structured
            interviews, resume matching, and a ranked shortlist — not a stack of
            unread CVs.
          </p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl space-y-16 px-4 sm:px-6">
          <div>
            <h2 className="font-display text-2xl text-ink">Our purpose</h2>
            <p className="mt-4 leading-relaxed text-[#6b5f7a]">
              Make hiring fair, fast, and defensible. Candidates get structured
              practice and feedback. Hiring teams automate first-stage screening
              and spend time only on people who clear the bar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px bg-[#e0d6ea] md:grid-cols-2">
            <div className="bg-white p-8">
              <h3 className="font-display text-xl text-ink">For candidates</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6b5f7a]">
                Practice interviews, resume matching, scored feedback, and
                guidance — in one place.
              </p>
              <Link
                href="/login/candidate"
                className="mt-5 inline-block text-sm font-semibold text-ink underline underline-offset-4"
              >
                Join as a candidate
              </Link>
            </div>
            <div className="bg-white p-8">
              <h3 className="font-display text-xl text-ink">For hiring teams</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6b5f7a]">
                Create roles, match resumes, review interview reports, and
                shortlist with evidence.
              </p>
              <Link
                href="/login/recruiter"
                className="mt-5 inline-block text-sm font-semibold text-ink underline underline-offset-4"
              >
                Join as HR
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
