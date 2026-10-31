"use client";

import { useState } from "react";
import { AuthCardLayout, RegisterForm, type AuthTab } from "./AuthCardParts";
import { GoogleSignInButton } from "./GoogleSignInButton";

/**
 * The HR portal's sign-in card. Admin accounts sign in here too — the backend
 * returns the role and `homePathForRole` routes them to the admin portal.
 * Only "hr" accounts can be created from here; admins are provisioned directly.
 */
export function RecruiterAuthCard() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <AuthCardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      portalLabel="Hiring portal"
      tagline="Your shortlist, ready by morning."
      support="AI interviews run overnight. Ranked candidates are waiting when you sit down."
      registerForm={
        <RegisterForm
          role="hr"
          emailLabel="Work email"
          emailPlaceholder="you@company.com"
          submitLabel="Create HR account"
        />
      }
      googleButton={<GoogleSignInButton role="hr" />}
    />
  );
}
