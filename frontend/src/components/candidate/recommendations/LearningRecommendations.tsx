"use client";

import { useState } from "react";
import {
  learningRecommendations,
  priorityStyles,
  typeIcons,
  type LearningRecommendation,
} from "./recommendationsData";

type Filter = "All" | LearningRecommendation["priority"];

export function LearningRecommendations() {
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = learningRecommendations.filter(
    (item) => filter === "All" || item.priority === filter,
  );

  const highCount = learningRecommendations.filter((i) => i.priority === "High").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Learning Recommendations</h1>
        <p className="text-gray-500 mt-1">
          Personalized resources based on your interview performance. {highCount} high-priority items
          need attention.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {(["All", "High", "Medium", "Low"] as Filter[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === item
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item === "All" ? "All" : `${item} Priority`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg">
                  {typeIcons[item.type]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-600">{item.skill}</p>
                  <h2 className="text-base font-bold text-gray-900">{item.title}</h2>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border shrink-0 ${priorityStyles[item.priority]}`}
              >
                {item.priority}
              </span>
            </div>

            <p className="text-sm text-gray-600 flex-1">{item.description}</p>

            <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
              <span className="bg-gray-50 px-2 py-1 rounded-lg">{item.type}</span>
              <span>{item.duration}</span>
              <span>{item.source}</span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{item.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              className="mt-5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {item.progress > 0 ? "Continue Learning" : "Start Learning"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Mock recommendations — real AI suggestions will connect when the backend is ready.
      </p>
    </div>
  );
}
