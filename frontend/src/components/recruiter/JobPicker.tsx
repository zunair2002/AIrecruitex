"use client";

import { BriefcaseBusiness } from "lucide-react";
import { JOB_STATUS_LABELS } from "@/lib/format";
import type { Job, ObjectId } from "@/lib/types";
import { selectClass } from "@/components/ui/controls";

/** Job selector backed by GET /api/jobs/mine. */
export function JobPicker({
  jobs,
  selectedJobId,
  onSelect,
  label = "Job",
}: {
  jobs: Job[];
  selectedJobId: ObjectId | null;
  onSelect: (jobId: ObjectId) => void;
  label?: string;
}) {
  return (
    <label className="flex w-full min-w-0 flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
      <span className="shrink-0 text-sm font-medium text-body">{label}</span>
      <span className="relative block w-full min-w-0 sm:w-80">
        <BriefcaseBusiness
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
        />
        <select
          value={selectedJobId ?? ""}
          onChange={(event) => onSelect(event.target.value)}
          className={`${selectClass} truncate pl-9! font-medium`}
        >
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title} · {JOB_STATUS_LABELS[job.status]}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
