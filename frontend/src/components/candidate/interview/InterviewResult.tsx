"use client";

import Link from "next/link";
import { useState } from "react";
import { interviewResults, scoreCategories } from "./interviewResultData";
import { FinalScoreRing, ScoreBar } from "./ScoreBreakdown";

export function InterviewResult() {
  const [selectedId, setSelectedId] = useState(interviewResults[0].id);
  const result = interviewResults.find((item) => item.id === selectedId) ?? interviewResults[0];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Interview Result</h1>
        <p className="text-gray-500 mt-1">
          Review your AI-evaluated scores across communication, technical, and confidence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Past Interviews
          </h2>
          <div className="space-y-2">
            {interviewResults.map((item) => {
              const isActive = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    isActive
                      ? "bg-indigo-50 border-indigo-200"
                      : "bg-white border-gray-100 hover:border-indigo-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`font-semibold text-sm ${isActive ? "text-indigo-900" : "text-gray-900"}`}>
                      {item.title}
                    </p>
                    <span className="text-sm font-bold text-indigo-600">{item.finalScore}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.type} · {item.date}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <FinalScoreRing score={result.finalScore} />
              <div className="flex-1 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {result.type} Interview
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-3">{result.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{result.date}</p>
                <p className="text-sm text-gray-600 mt-4 leading-relaxed">{result.feedback}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scoreCategories.map((cat) => (
              <ScoreBar
                key={cat.key}
                label={cat.label}
                score={result[cat.key]}
                gradient={cat.color}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/candidate/recommendations"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl text-center transition-colors"
            >
              View Learning Recommendations
            </Link>
            <Link
              href="/candidate/interview/basic"
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl text-center hover:bg-gray-50 transition-colors"
            >
              Practice Again
            </Link>
          </div>

          <p className="text-xs text-gray-400">
            Mock scores — real AI evaluation will connect when the backend is ready.
          </p>
        </div>
      </div>
    </div>
  );
}
