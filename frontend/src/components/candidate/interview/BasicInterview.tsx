"use client";

import Link from "next/link";
import { useState } from "react";
import { basicQuestions } from "./basicInterviewData";

type Phase = "start" | "active" | "complete";

export function BasicInterview() {
  const [phase, setPhase] = useState<Phase>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => basicQuestions.map(() => ""));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = basicQuestions[currentIndex];
  const progress = ((currentIndex + 1) / basicQuestions.length) * 100;
  const currentAnswer = answers[currentIndex] ?? "";

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => prev.map((item, i) => (i === currentIndex ? value : item)));
  };

  const handleNext = () => {
    if (currentIndex < basicQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setPhase("complete");
    }, 1200);
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  if (phase === "start") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-2xl text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg">
            🎤
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Basic Practice Interview</h1>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Practice common HR questions. Answer all 3 prompts at your own pace. AI scoring will
            connect when the backend is ready.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {basicQuestions.map((item, i) => (
              <div key={item.id} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-indigo-600">Q{i + 1}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{item.title}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPhase("active")}
            className="mt-10 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-xl text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
            OK
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Complete!</h1>
          <p className="text-gray-500 mt-3">
            You answered all {basicQuestions.length} basic practice questions. Detailed scores will
            appear on the Interview Result page once AI evaluation is connected.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/candidate/dashboard"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Back to Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                setPhase("start");
                setCurrentIndex(0);
                setAnswers(basicQuestions.map(() => ""));
              }}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Practice Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Basic Practice</span>
          <span>
            Question {currentIndex + 1} of {basicQuestions.length}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-xl shrink-0">
            AI
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Interviewer</p>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{question.title}</h2>
            <p className="text-gray-600 mt-2">{question.prompt}</p>
            <p className="text-xs text-gray-400 mt-3 bg-gray-50 rounded-lg px-3 py-2 inline-block">
              Tip: {question.tip}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Your Answer</label>
        <textarea
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          rows={8}
          placeholder="Type your answer here..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-2">{currentAnswer.trim().split(/\s+/).filter(Boolean).length} words</p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:text-gray-900 transition-colors"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!currentAnswer.trim() || isSubmitting}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {isSubmitting
            ? "Submitting..."
            : currentIndex === basicQuestions.length - 1
              ? "Finish Interview"
              : "Next Question"}
        </button>
      </div>
    </div>
  );
}
