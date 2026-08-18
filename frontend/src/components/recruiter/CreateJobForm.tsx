"use client";

import Link from "next/link";
import { useState } from "react";
import { saveCreatedJob } from "@/lib/recruiterJobsStorage";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

const experienceOptions = [
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5+ years",
];

type FormState = {
  title: string;
  description: string;
  skills: string;
  experience: string;
};

const initialForm: FormState = {
  title: "",
  description: "",
  skills: "",
  experience: "",
};

export function CreateJobForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    form.title.trim() &&
    form.description.trim() &&
    form.skills.trim() &&
    form.experience;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    setTimeout(() => {
      saveCreatedJob({
        title: form.title.trim(),
        description: form.description.trim(),
        skills: form.skills.trim(),
        experience: form.experience,
      });
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
          OK
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Job Posted Successfully!</h2>
        <p className="text-gray-500 mt-3">
          <span className="font-semibold text-gray-700">{form.title}</span> is now live.
          Candidates can apply once the backend is connected.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/recruiter/dashboard"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              setForm(initialForm);
              setIsSuccess(false);
            }}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Post Another Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Job</h1>
        <p className="text-gray-500 mt-1">
          Post a new job opening. AI will match resumes against your requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Job Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. React Developer"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={6}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Skills Required</label>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => update("skills", e.target.value)}
            placeholder="e.g. React, TypeScript, Node.js, MongoDB"
            className={inputClass}
          />
          <p className="text-xs text-gray-400 mt-2">Separate skills with commas</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Experience</label>
          <select
            value={form.experience}
            onChange={(e) => update("experience", e.target.value)}
            className={inputClass}
          >
            <option value="">Select experience level</option>
            {experienceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {isSubmitting ? "Posting..." : "Post Job"}
          </button>
          <Link
            href="/recruiter/dashboard"
            className="px-6 py-3 text-gray-600 font-semibold hover:text-gray-900 transition-colors"
          >
            Cancel
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Job is saved locally for now — backend API will connect later.
        </p>
      </form>
    </div>
  );
}
