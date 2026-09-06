"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { createJob, JD_FILE_FIELD } from "@/lib/jobsApi";
import {
  RESUME_ACCEPTED_MIME_TYPES,
  RESUME_ACCEPT_ATTRIBUTE,
  RESUME_MAX_BYTES,
} from "@/lib/resumeApi";
import { formatFileSize } from "@/lib/format";
import type { Job } from "@/lib/types";
import { InlineError, PageHeader, SkillChips } from "@/components/ui/Feedback";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui/controls";

const MAX_SIZE_MB = RESUME_MAX_BYTES / (1024 * 1024);

/**
 * POST /api/jobs — the backend's Job schema has exactly these writable fields:
 * title, description, requiredSkills[] and an optional JD file (multer field
 * "jd", which also fills jdFileUrl/jdRawText). Skills are lowercased and
 * de-duplicated server-side; leaving them blank makes the backend suggest them
 * from the JD text, and with neither it returns a 400.
 */
export function CreateJobForm() {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<Job | null>(null);

  const parsedSkills = skillsInput
    .split(",")
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
  const uniqueSkills = Array.from(new Set(parsedSkills));

  const isValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    (uniqueSkills.length > 0 || jdFile !== null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!RESUME_ACCEPTED_MIME_TYPES.includes(file.type)) {
      setError("The job description must be a PDF or DOCX file.");
      return;
    }
    if (file.size > RESUME_MAX_BYTES) {
      setError(`The job description must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    setError(null);
    setJdFile(file);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSkillsInput("");
    setJdFile(null);
    setError(null);
    setCreated(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      setCreated(
        await createJob(
          {
            title: title.trim(),
            description: description.trim(),
            requiredSkills: uniqueSkills,
            jdFile,
          },
          token,
        ),
      );
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
          OK
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Job posted</h2>
        <p className="mt-3 text-gray-500">
          <span className="font-semibold text-gray-700">{created.title}</span> is
          now open. Candidates can apply and will be scored against its required
          skills.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Required skills stored ({created.requiredSkills.length})
          </p>
          <SkillChips skills={created.requiredSkills} />
          {created.jdFileUrl && (
            <a
              href={created.jdFileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              View uploaded job description
            </a>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/recruiter/applicants?jobId=${created._id}`}
            className={`${primaryButtonClass} text-sm`}
          >
            View applicants
          </Link>
          <button type="button" onClick={resetForm} className={`${secondaryButtonClass} text-sm`}>
            Post another job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Create Job"
        description="Candidates' resumes are matched against the required skills you list here."
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
      >
        {error && <InlineError message={error} />}

        <div>
          <label htmlFor="job-title" className={labelClass}>
            Job title <span className="text-red-500">*</span>
          </label>
          <input
            id="job-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. React Developer"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="job-description" className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="job-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            placeholder="Describe the role, responsibilities and what you&apos;re looking for…"
            className={`${inputClass} resize-none`}
            required
          />
        </div>

        <div>
          <label htmlFor="job-skills" className={labelClass}>
            Required skills
          </label>
          <input
            id="job-skills"
            type="text"
            value={skillsInput}
            onChange={(event) => setSkillsInput(event.target.value)}
            placeholder="e.g. react, typescript, node.js, mongodb"
            className={inputClass}
          />
          <p className="mt-2 text-xs text-gray-400">
            Comma separated. These are the exact terms searched in each
            candidate&apos;s resume text — the match score is the share of them found.
          </p>
          {uniqueSkills.length > 0 && (
            <div className="mt-3">
              <SkillChips skills={uniqueSkills} />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="job-jd" className={labelClass}>
            Job description file (optional)
          </label>
          <input
            id="job-jd"
            ref={fileInputRef}
            name={JD_FILE_FIELD}
            type="file"
            accept={RESUME_ACCEPT_ATTRIBUTE}
            onChange={(event) => handleFile(event.target.files?.[0])}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700"
          />
          <p className="mt-2 text-xs text-gray-400">
            PDF or DOCX, max {MAX_SIZE_MB}MB. If you leave the skills field empty,
            skills are suggested from this file&apos;s text.
          </p>
          {jdFile && (
            <p className="mt-2 text-xs font-medium text-gray-600">
              {jdFile.name} · {formatFileSize(jdFile.size)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={primaryButtonClass}
          >
            {isSubmitting ? "Posting…" : "Post Job"}
          </button>
          <Link
            href="/recruiter/dashboard"
            className="px-6 py-3 font-semibold text-gray-600 transition-colors hover:text-gray-900"
          >
            Cancel
          </Link>
        </div>

        {!isValid && (title || description) && (
          <p className="text-xs text-gray-400">
            Add at least one required skill, or attach a job description file to
            have them suggested.
          </p>
        )}
      </form>
    </div>
  );
}
