"use client";

import { useState } from "react";
import { AuthCardLayout, RegisterForm, type AuthTab } from "./AuthCardParts";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function CandidateAuthCard() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <AuthCardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      portalLabel="Candidate portal"
      tagline="Walk in prepared."
      support="Practice interviews, resume matching, and scored feedback — so the real round is never the first round."
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
