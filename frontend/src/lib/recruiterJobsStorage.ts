export type CreatedJob = {
  id: string;
  title: string;
  description: string;
  skills: string;
  experience: string;
  createdAt: string;
};

const STORAGE_KEY = "airecruitx_recruiter_jobs";
export const JOBS_UPDATED_EVENT = "recruiter-jobs-updated";

function readJobs(): CreatedJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CreatedJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCreatedJobs(): CreatedJob[] {
  return readJobs();
}

export function getCreatedJobTitles(): string[] {
  return getCreatedJobs().map((job) => job.title);
}

export function saveCreatedJob(
  job: Omit<CreatedJob, "id" | "createdAt">,
): CreatedJob {
  const entry: CreatedJob = {
    ...job,
    id: `job-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const jobs = [...readJobs(), entry];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  window.dispatchEvent(new Event(JOBS_UPDATED_EVENT));
  return entry;
}
