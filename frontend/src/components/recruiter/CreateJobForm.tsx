"use client";

import { useRef, useState } from "react";
import {
  CircleCheck,
  CloudUpload,
  ExternalLink,
  FileText,
  ListChecks,
  Plus,
  ScanSearch,
  Sparkles,
} from "lucide-react";
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
import {
  Button,
  Card,
  InlineError,
  PageHeader,
  SkillChips,
} from "@/components/ui";
import {
  helpTextClass,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/ui/controls";
import { PortalPage } from "@/components/dashboard/primitives";
import { useToast } from "@/context/ToastContext";

const MAX_SIZE_MB = RESUME_MAX_BYTES / (1024 * 1024);

function Required() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-rose-600">
      *
    </span>
  );
}

/**
 * POST /api/jobs — the backend's Job schema has exactly these writable fields:
 * title, description, requiredSkills[] and an optional JD file (multer field
 * "jd", which also fills jdFileUrl/jdRawText). Skills are lowercased and
 * de-duplicated server-side; leaving them blank makes the backend suggest them
 * from the JD text, and with neither it returns a 400.
 */
export function CreateJobForm() {
  const { token } = useAuth();
  const { toast } = useToast();
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
      const job = await createJob(
          {
            title: title.trim(),
            description: description.trim(),
            requiredSkills: uniqueSkills,
            jdFile,
        },
        token,
      );
      setCreated(job);
      toast({
        title: "Job posted",
        detail: `${job.title} is now open to candidates.`,
      });
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (created) {
    return (
      <PortalPage>
        <div className="mx-auto w-full max-w-xl">
          <Card>
            <div className="text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-600/20"
              >
                <CircleCheck className="h-6 w-6" />
              </span>
              <h1 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                Job posted
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                <span className="font-semibold text-ink">{created.title}</span>{" "}
                is now open. Candidates can apply and will be scored against its
                required skills.
              </p>
            </div>

            <div className="mt-6 rounded-lg border border-line-soft bg-surface-2 p-4">
              <p className="text-xs font-medium text-muted">
                Required skills stored ({created.requiredSkills.length})
              </p>
              <div className="mt-2.5">
                <SkillChips skills={created.requiredSkills} />
              </div>
              {created.jdFileUrl && (
                <a
                  href={created.jdFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-brand-700 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  View uploaded job description
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <Button
                variant="secondary"
                onClick={resetForm}
                leadingIcon={<Plus aria-hidden="true" />}
              >
                Post another job
              </Button>
              <Button href={`/recruiter/applicants?jobId=${created._id}`}>
                View applicants
              </Button>
            </div>
          </Card>
        </div>
      </PortalPage>
    );
  }

  return (
    <PortalPage>
      <PageHeader
        title="Create job"
        description="Candidates' resumes are matched against the required skills you list here."
        backHref="/recruiter/jobs"
        backLabel="Back to jobs"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <form
          onSubmit={handleSubmit}
          className="min-w-0 rounded-xl border border-line bg-surface shadow-xs lg:col-span-2"
        >
          <div className="space-y-8 p-5 sm:p-6">
            {error && <InlineError message={error} />}

            {/* ---- details ---- */}
            <section className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-ink">Job details</h2>
                <p className="mt-1 text-sm text-muted">
                  What candidates see when they browse open roles.
                </p>
              </div>

              <div>
                <label htmlFor="job-title" className={labelClass}>
                  Job title <Required />
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
                  Description <Required />
                </label>
                <textarea
                  id="job-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={6}
                  placeholder="Describe the role, responsibilities and what you're looking for…"
                  className={`${textareaClass} resize-y`}
                  required
                />
              </div>
            </section>

            {/* ---- skills ---- */}
            <section className="space-y-5 border-t border-line-soft pt-8">
              <div>
                <h2 className="text-base font-semibold text-ink">Matching</h2>
                <p className="mt-1 text-sm text-muted">
                  List the required skills, attach the job description, or both.
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor="job-skills" className={labelClass}>
                    Required skills
                  </label>
                  <span className="text-xs text-muted tabular-nums">
                    {uniqueSkills.length} skill
                    {uniqueSkills.length === 1 ? "" : "s"}
                  </span>
                </div>
                <input
                  id="job-skills"
                  type="text"
                  value={skillsInput}
                  onChange={(event) => setSkillsInput(event.target.value)}
                  placeholder="e.g. react, typescript, node.js, mongodb"
                  aria-describedby="job-skills-help"
                  className={inputClass}
                />
                <p id="job-skills-help" className={helpTextClass}>
                  Comma separated. These are the exact terms searched in each
                  candidate&apos;s resume text — the match score is the share of
                  them found.
                </p>
                <div className="mt-3 rounded-lg border border-dashed border-line bg-surface-2 p-3">
                  {uniqueSkills.length > 0 ? (
                    <SkillChips skills={uniqueSkills} />
                  ) : (
                    <p className="text-sm text-muted">
                      Skills you type appear here as chips.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="job-jd" className={labelClass}>
                  Job description file{" "}
                  <span className="font-normal text-muted">(optional)</span>
                </label>
                <div
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 hover:border-brand-300 hover:bg-brand-50/50 ${
                    jdFile
                      ? "border-brand-200 bg-brand-50/50"
                      : "border-line bg-surface-2/60"
                  }`}
                >
                  <input
                    id="job-jd"
                    ref={fileInputRef}
                    name={JD_FILE_FIELD}
                    type="file"
                    accept={RESUME_ACCEPT_ATTRIBUTE}
                    onChange={(event) => handleFile(event.target.files?.[0])}
                    aria-describedby="job-jd-help"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-700 shadow-xs ring-1 ring-inset ring-line"
                  >
                    {jdFile ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <CloudUpload className="h-5 w-5" />
                    )}
                  </span>
                  {jdFile ? (
                    <>
                      <p className="max-w-full break-all text-sm font-medium text-ink">
                        {jdFile.name}
                      </p>
                      <p className="text-xs text-muted">
                        {formatFileSize(jdFile.size)} · click to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-body">
                        <span className="font-semibold text-brand-700">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-muted">
                        PDF or DOCX, max {MAX_SIZE_MB}MB
                      </p>
                    </>
                  )}
                </div>
                <p id="job-jd-help" className={helpTextClass}>
                  If you leave the skills field empty, skills are suggested from
                  this file&apos;s text.
                </p>
              </div>
            </section>
          </div>

          <div className="flex flex-col-reverse gap-3 rounded-b-xl border-t border-line-soft bg-surface-2/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            {!isValid && (title || description) && (
              <p className="text-xs text-muted sm:mr-auto">
                Add at least one required skill, or attach a job description file
                to have them suggested.
              </p>
            )}
            <Button variant="secondary" href="/recruiter/dashboard">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "Posting…" : "Post job"}
            </Button>
          </div>
        </form>

        <aside className="min-w-0">
          <Card
            title="How matching works"
            description="Every applicant is scored against this job automatically."
            className="lg:sticky lg:top-6"
          >
            <ol className="space-y-4">
              <HowStep
                icon={<ListChecks />}
                title="List the skills"
                text="Each required skill is searched for in the candidate's resume text."
              />
              <HowStep
                icon={<ScanSearch />}
                title="Score every applicant"
                text="The match score is the share of your required skills found."
              />
              <HowStep
                icon={<Sparkles />}
                title="No skills yet?"
                text="Attach the job description and skills are suggested from its text."
              />
            </ol>
          </Card>
        </aside>
      </div>
    </PortalPage>
  );
}

function HowStep({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 [&>svg]:h-4 [&>svg]:w-4"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{text}</p>
      </div>
    </li>
  );
}
