"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getCreatedJobTitles,
  JOBS_UPDATED_EVENT,
} from "@/lib/recruiterJobsStorage";
import {
  isApplicantShortlisted,
  removeFromShortlist,
  useShortlistSnapshot,
} from "@/lib/shortlistedStorage";
import { applicants, getMatchColor } from "../applicants/applicantsData";
import { interviewReports } from "../reports/reportsData";

const ALL_JOBS = "All Jobs";

function getInterviewScore(name: string, jobTitle: string) {
  return interviewReports.find(
    (r) => r.candidateName === name && r.jobTitle === jobTitle,
  )?.finalScore;
}

export function ShortlistedList() {
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState(ALL_JOBS);
  const [createdJobs, setCreatedJobs] = useState<string[]>([]);
  const shortlistSnapshot = useShortlistSnapshot();
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const loadJobs = () => {
      const titles = getCreatedJobTitles();
      setCreatedJobs(titles);
      setJobFilter((current) => {
        if (current === ALL_JOBS) return ALL_JOBS;
        return titles.includes(current) ? current : ALL_JOBS;
      });
    };

    loadJobs();
    window.addEventListener(JOBS_UPDATED_EVENT, loadJobs);
    window.addEventListener("storage", loadJobs);
    return () => {
      window.removeEventListener(JOBS_UPDATED_EVENT, loadJobs);
      window.removeEventListener("storage", loadJobs);
    };
  }, []);

  const jobOptions = useMemo(() => [ALL_JOBS, ...createdJobs], [createdJobs]);

  const filtered = useMemo(() => {
    const createdSet = new Set(createdJobs);
    return applicants.filter((item) => {
      if (!isApplicantShortlisted(item.id, item.status === "Shortlisted")) return false;
      if (!createdSet.has(item.jobTitle)) return false;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase());
      const matchesJob = jobFilter === ALL_JOBS || item.jobTitle === jobFilter;
      return matchesSearch && matchesJob;
    });
  }, [search, jobFilter, createdJobs, shortlistSnapshot]);

  const visible = useMemo(
    () => filtered.filter((item) => !hiddenIds.has(item.id)),
    [filtered, hiddenIds],
  );

  const handleRemove = (applicantId: string) => {
    setHiddenIds((prev) => new Set(prev).add(applicantId));
    removeFromShortlist(applicantId);
  };

  const hasNoJobs = createdJobs.length === 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shortlisted Candidates</h1>
        <p className="text-gray-500 mt-1">
          Candidates selected after AI interview review — ready for the next hiring step.
        </p>
      </div>

      {hasNoJobs ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-600 font-medium">No jobs created yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Create a job first — shortlisted candidates appear for your posted roles.
          </p>
          <Link
            href="/recruiter/jobs/create"
            className="inline-block mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            Create Job
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[200px]"
            >
              {jobOptions.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>

          {visible.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-gray-600 font-medium">No shortlisted candidates yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Review interview reports and shortlist top performers.
              </p>
              <Link
                href="/recruiter/reports"
                className="inline-block mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
              >
                View Interview Reports
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {visible.map((candidate) => {
                const interviewScore = getInterviewScore(candidate.name, candidate.jobTitle);
                return (
                  <div
                    key={candidate.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h2 className="font-bold text-gray-900">{candidate.name}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{candidate.email}</p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 shrink-0">
                            Shortlisted
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-3 font-medium">{candidate.jobTitle}</p>
                        <div className="flex flex-wrap gap-3 mt-3 text-sm">
                          <span className={`font-bold ${getMatchColor(candidate.match)}`}>
                            {candidate.match}% match
                          </span>
                          {interviewScore !== undefined && (
                            <span className="text-indigo-600 font-bold">
                              {interviewScore}% interview
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          View resume: {candidate.resume}
                        </button>
                        <p className="text-xs text-gray-400 mt-2">Shortlisted · {candidate.appliedDate}</p>
                        <button
                          type="button"
                          onClick={() => handleRemove(candidate.id)}
                          className="mt-3 text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                        >
                          Remove from shortlist
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            Linked to Interview Reports — mock data until the API is connected.
          </p>
        </>
      )}
    </div>
  );
}
