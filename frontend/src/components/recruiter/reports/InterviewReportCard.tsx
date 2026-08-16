"use client";

import { useEffect, useState } from "react";
import type { InterviewReport } from "./reportsData";

type ReportCardProps = {
  report: InterviewReport;
  isSelected: boolean;
  onSelect: () => void;
};

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-1">{value}%</p>
    </div>
  );
}

export function InterviewReportCard({ report, isSelected, onSelect }: ReportCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-xl border transition-all ${
        isSelected
          ? "border-indigo-300 bg-indigo-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-indigo-100 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{report.candidateName}</p>
          <p className="text-xs text-gray-500 mt-1">
            {report.jobTitle} · {report.interviewDate}
          </p>
        </div>
        <span className="text-xl font-bold text-indigo-600">{report.finalScore}%</span>
      </div>
    </button>
  );
}

export function InterviewReportDetail({
  report,
  isShortlisted,
  onShortlist,
}: {
  report: InterviewReport;
  isShortlisted?: boolean;
  onShortlist?: () => void;
}) {
  const [showShortlisted, setShowShortlisted] = useState(Boolean(isShortlisted));

  useEffect(() => {
    setShowShortlisted(Boolean(isShortlisted));
  }, [isShortlisted, report.id]);

  const handleShortlist = () => {
    setShowShortlisted(true);
    onShortlist?.();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{report.candidateName}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {report.jobTitle} · Interviewed on {report.interviewDate}
          </p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-indigo-600">{report.finalScore}%</p>
          <p className="text-xs text-gray-500 mt-1">Final Score</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <ScorePill label="Communication" value={report.communication} />
        <ScorePill label="Technical" value={report.technical} />
        <ScorePill label="Confidence" value={report.confidence} />
      </div>

      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-2">
          AI Feedback
        </p>
        <p className="text-sm text-indigo-900 leading-relaxed">{report.feedback}</p>
      </div>

      {onShortlist && (
        showShortlisted ? (
          <p className="text-sm font-semibold text-indigo-600">Added to shortlist</p>
        ) : (
          <button
            type="button"
            onClick={handleShortlist}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Shortlist Candidate
          </button>
        )
      )}
    </div>
  );
}
