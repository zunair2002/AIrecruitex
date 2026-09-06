"use client";

import { useState } from "react";
import { AuthCardLayout, RegisterForm, type AuthTab } from "./AuthCardParts";

export function CandidateAuthCard() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <AuthCardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      registerForm={
        <RegisterForm
          role="candidate"
          emailPlaceholder="you@email.com"
          submitLabel="Create candidate account"
        />
      }
    />
  );
}
