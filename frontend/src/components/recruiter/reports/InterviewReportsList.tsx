"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getCreatedJobTitles,
  JOBS_UPDATED_EVENT,
} from "@/lib/recruiterJobsStorage";
import {
  isApplicantShortlisted,
  shortlistApplicant,
  useShortlistSnapshot,
} from "@/lib/shortlistedStorage";
import { applicants } from "../applicants/applicantsData";
import { InterviewReportCard, InterviewReportDetail } from "./InterviewReportCard";
import { interviewReports, type InterviewReport } from "./reportsData";

const ALL_JOBS = "All Jobs";

export function InterviewReportsList() {
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState(ALL_JOBS);
  const [createdJobs, setCreatedJobs] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shortlistSnapshot = useShortlistSnapshot();

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
    return interviewReports.filter((item) => {
      if (!createdSet.has(item.jobTitle)) return false;
      const matchesSearch = item.candidateName.toLowerCase().includes(search.toLowerCase());
      const matchesJob = jobFilter === ALL_JOBS || item.jobTitle === jobFilter;
      return matchesSearch && matchesJob;
    });
  }, [search, jobFilter, createdJobs]);

  const selectedReport: InterviewReport | undefined =
    filtered.find((r) => r.id === selectedId) ?? filtered[0];

  useEffect(() => {
    if (filtered.length > 0 && (!selectedId || !filtered.some((r) => r.id === selectedId))) {
      setSelectedId(filtered[0].id);
    }
    if (filtered.length === 0) setSelectedId(null);
  }, [filtered, selectedId]);

  const selectedShortlist = useMemo(() => {
    if (!selectedReport) return { applicantId: null, isShortlisted: false };
    const applicant = applicants.find(
      (a) => a.name === selectedReport.candidateName && a.jobTitle === selectedReport.jobTitle,
    );
    if (!applicant) return { applicantId: null, isShortlisted: false };
    return {
      applicantId: applicant.id,
      isShortlisted: isApplicantShortlisted(applicant.id, applicant.status === "Shortlisted"),
    };
  }, [selectedReport, shortlistSnapshot]);

  const hasNoJobs = createdJobs.length === 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Interview Reports</h1>
        <p className="text-gray-500 mt-1">
          AI-evaluated interview results for applicants on your posted jobs.
        </p>
      </div>

      {hasNoJobs ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-600 font-medium">No jobs created yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Create a job first — reports will appear for applicants who complete AI interviews on
            your posted roles.
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
              placeholder="Search by candidate name..."
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

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500">
              No interview reports for this job yet. Reports appear when applicants complete AI
              interviews.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-2">
                {filtered.map((report) => (
                  <InterviewReportCard
                    key={report.id}
                    report={report}
                    isSelected={selectedReport?.id === report.id}
                    onSelect={() => setSelectedId(report.id)}
                  />
                ))}
              </div>
              <div className="lg:col-span-2">
                {selectedReport && (
                  <InterviewReportDetail
                    report={selectedReport}
                    isShortlisted={selectedShortlist.isShortlisted}
                    onShortlist={
                      selectedShortlist.applicantId
                        ? () => shortlistApplicant(selectedShortlist.applicantId!)
                        : undefined
                    }
                  />
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            Linked to Applicants — mock reports until the backend API is connected.
          </p>
        </>
      )}
    </div>
  );
}
