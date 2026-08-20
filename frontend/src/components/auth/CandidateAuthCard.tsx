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

function CandidateRegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
    // The backend rejects anything shorter, so catch it before the round trip.
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register({
        name,
        email: email.trim(),
        password,
        role: "candidate",
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
          <label htmlFor="candidate-first-name" className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            id="candidate-first-name"
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
          <label htmlFor="candidate-last-name" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            id="candidate-last-name"
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
        <label htmlFor="candidate-email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="candidate-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
          className={authInputClass}
        />
      </div>
      <div>
        <label htmlFor="candidate-password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          id="candidate-password"
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

export function CandidateAuthCard() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <AuthCardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      registerForm={<CandidateRegisterForm />}
    />
  );
}
