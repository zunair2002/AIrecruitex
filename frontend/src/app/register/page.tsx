"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthError, toErrorMessage } from "@/components/auth/AuthCardParts";
import { useAuth, homePathForRole } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all";

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
      // This page is the company-facing sign-up, so it creates an "hr" account.
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
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="flex w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] m-4">

          {/* Left Side - Graphic */}
          <div className="hidden lg:flex w-1/2 bg-purple-50 items-center justify-center relative p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 opacity-90"></div>

            {/* Decorative elements */}
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>

            <div className="relative z-10 text-white max-w-lg">
              <h3 className="text-4xl font-bold mb-6">Build Your Dream Team</h3>
              <p className="text-purple-100 text-lg leading-relaxed mb-8">
                Join thousands of companies using Skreena to screen smarter and hire faster. Create your account today.
              </p>

              {/* Abstract UI representation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                  <div className="h-10 w-10 bg-white/20 rounded-xl mb-4"></div>
                  <div className="h-3 w-16 bg-white/20 rounded-full mb-2"></div>
                  <div className="h-2 w-24 bg-white/10 rounded-full"></div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl mt-8">
                  <div className="h-10 w-10 bg-white/20 rounded-xl mb-4"></div>
                  <div className="h-3 w-16 bg-white/20 rounded-full mb-2"></div>
                  <div className="h-2 w-24 bg-white/10 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12">
            <div className="max-w-md w-full mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h2>
              <p className="text-gray-500 mb-8">Start streamlining your hiring process today.</p>

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <AuthError message={error} />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="register-first-name" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      id="register-first-name"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="Jane"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="register-last-name" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      id="register-last-name"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Doe"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-company" className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    id="register-company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Acme Inc."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="jane@acme.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    id="register-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg shadow-purple-200 mt-4"
                >
                  {isSubmitting ? "Creating account…" : "Create Account"}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
