"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getCreatedJobTitles,
  JOBS_UPDATED_EVENT,
} from "@/lib/recruiterJobsStorage";
import {
  applicants,
  getMatchColor,
  statusStyles,
} from "./applicantsData";

const ALL_JOBS = "All Jobs";

export function ApplicantsList() {
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState(ALL_JOBS);
  const [createdJobs, setCreatedJobs] = useState<string[]>([]);

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
      if (!createdSet.has(item.jobTitle)) return false;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase());
      const matchesJob = jobFilter === ALL_JOBS || item.jobTitle === jobFilter;
      return matchesSearch && matchesJob;
    });
  }, [search, jobFilter, createdJobs]);

  const hasNoJobs = createdJobs.length === 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
        <p className="text-gray-500 mt-1">
          Review candidates who applied to your job postings with AI match scores.
        </p>
      </div>

      {hasNoJobs ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-600 font-medium">No jobs created yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Create a job first — only your posted jobs will appear in the filter dropdown.
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

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Resume</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Job</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Match %</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Applied</th>
                    {/* <th className="text-left px-6 py-4 font-semibold text-gray-600">Action</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((applicant) => (
                    <tr
                      key={applicant.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                            {applicant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{applicant.name}</p>
                            <p className="text-xs text-gray-500">{applicant.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          <span className="text-base">PDF</span>
                          {applicant.resume}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{applicant.jobTitle}</td>
                      <td className="px-6 py-4">
                        <span className={`text-lg font-bold ${getMatchColor(applicant.match)}`}>
                          {applicant.match}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${statusStyles[applicant.status]}`}
                        >
                          {applicant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{applicant.appliedDate}</td>
                      <td className="px-6 py-4">
                        {/* {isApplicantShortlisted(applicant.id, applicant.status === "Shortlisted") ? (
                          <span className="text-xs font-semibold text-indigo-600">Shortlisted</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => shortlistApplicant(applicant.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                          >
                            Shortlist
                          </button>
                        )} */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No applicants found for this job yet.
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Filter shows only jobs you created. Applicant rows are mock data until the API is connected.
          </p>
        </>
      )}
    </div>
  );
}
