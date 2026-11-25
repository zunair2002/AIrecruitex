"use client";

import { useState } from "react";
import { BellRing, FileSearch, MessagesSquare } from "lucide-react";
import { AuthCardLayout, RegisterForm, type AuthTab } from "./AuthCardParts";
import { GoogleSignInButton } from "./GoogleSignInButton";

const CANDIDATE_BENEFITS = [
  {
    icon: <MessagesSquare />,
    title: "Practice AI interviews",
    description: "Rehearse real questions and get scored, answer-by-answer feedback.",
  },
  {
    icon: <FileSearch />,
    title: "Resume match scores",
    description: "See how your resume lines up with a job before you apply.",
  },
  {
    icon: <BellRing />,
    title: "Live application updates",
    description: "Decisions and interview invites the moment they happen.",
  },
];

export function CandidateAuthCard() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <AuthCardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      portalLabel="Candidate portal"
      tagline="Walk in prepared."
      support="Practice interviews, resume matching, and scored feedback — so the real round is never the first round."
      benefits={CANDIDATE_BENEFITS}
      switchPortal={{
        prompt: "Hiring for a team?",
        label: "Recruiter sign in",
        href: "/login/recruiter",
      }}
      registerForm={
        <RegisterForm
          role="candidate"
          emailPlaceholder="you@email.com"
          submitLabel="Create candidate account"
        />
      }
      googleButton={<GoogleSignInButton role="candidate" />}
    />
  );
}
