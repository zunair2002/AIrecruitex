"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, homePathForRole } from "@/context/AuthContext";
import {
  AuthCardLayout,
  AuthError,
  authInputClass,
  authSubmitClass,
  toErrorMessage,
  type AuthTab,
} from "./AuthCardParts";

function RecruiterRegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!name) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Recruiters map to the backend's "hr" role. Company name is collected
      // here but the signup endpoint has no field for it yet.
      const user = await register({
        name,
        email: email.trim(),
        password,
        role: "hr",
      });
      router.replace(homePathForRole(user.role));
    } catch (err) {
      setError(toErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <AuthError message={error} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="recruiter-first-name" className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            id="recruiter-first-name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Jane"
            className={authInputClass}
          />
        </div>
        <div>
          <label htmlFor="recruiter-last-name" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            id="recruiter-last-name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Doe"
            className={authInputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="recruiter-company" className="block text-sm font-medium text-gray-700 mb-2">
          Company Name
        </label>
        <input
          id="recruiter-company"
          name="company"
          type="text"
          autoComplete="organization"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          placeholder="Acme Inc."
          className={authInputClass}
        />
      </div>
      <div>
        <label htmlFor="recruiter-email" className="block text-sm font-medium text-gray-700 mb-2">
          Work Email
        </label>
        <input
          id="recruiter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className={authInputClass}
        />
      </div>
      <div>
        <label htmlFor="recruiter-password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          id="recruiter-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          className={authInputClass}
        />
      </div>
      <button type="submit" disabled={isSubmitting} className={authSubmitClass}>
        {isSubmitting ? "Creating account…" : "Register"}
      </button>
    </form>
  );
}

export function RecruiterAuthCard() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <AuthCardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      registerForm={<RecruiterRegisterForm />}
    />
  );
}
