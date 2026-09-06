"use client";

import { JOB_STATUS_LABELS } from "@/lib/format";
import type { Job, ObjectId } from "@/lib/types";
import { compactInputClass } from "@/components/ui/controls";

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
    <label className="flex items-center gap-3 text-sm text-gray-600">
      <span className="font-semibold text-gray-900">{label}</span>
      <select
        value={selectedJobId ?? ""}
        onChange={(event) => onSelect(event.target.value)}
        className={`${compactInputClass} min-w-[240px]`}
      >
        {jobs.map((job) => (
          <option key={job._id} value={job._id}>
            {job.title} · {JOB_STATUS_LABELS[job.status]}
          </option>
        ))}
      </select>
    </label>
  );
}
