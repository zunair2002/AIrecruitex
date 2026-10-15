"use client";

import { useEffect, useState } from "react";
import { useVoiceInterview } from "@/hooks/useVoiceInterview";
import { InlineError } from "@/components/ui/Feedback";

const joinText = (base: string, spoken: string) =>
  [base.trim(), spoken.trim()].filter(Boolean).join(" ");

/**
 * Answer state for one interview question, typed or dictated.
 *
 * While dictating, the textarea shows whatever was there when the mic started
 * (`voiceBase`) followed by the live transcript. Typing commits that combined
 * text back to `answer` and stops the mic, so the candidate can always edit.
 * Each new `question` is read aloud automatically.
 */
export function useVoiceAnswer(question: string | undefined) {
  const voice = useVoiceInterview();
  const { speak } = voice;
  const [answer, setAnswer] = useState("");
  const [voiceBase, setVoiceBase] = useState<string | null>(null);

  const value = voiceBase === null ? answer : joinText(voiceBase, voice.transcript);

  useEffect(() => {
    if (!question) return;
    void speak(question);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [question, speak]);

  const onChange = (text: string) => {
    if (voice.listening) voice.stopListening();
    setVoiceBase(null);
    setAnswer(text);
  };

  const toggleListening = () => {
    if (voice.listening) {
      // Keep `voiceBase` so a final result that lands after stopping still shows.
      voice.stopListening();
      return;
    }
    setVoiceBase(value);
    voice.startListening();
  };

  const readQuestion = () => {
    if (!question) return;
    if (voice.listening) voice.stopListening();
    void speak(question);
  };

  /** Stops the mic and returns the answer to submit. */
  const takeAnswer = () => {
    if (voice.listening) voice.stopListening();
    return value.trim();
  };

  const reset = () => {
    setAnswer("");
    setVoiceBase(null);
    voice.setTranscript("");
  };

  return { voice, value, onChange, toggleListening, readQuestion, takeAnswer, reset };
}

export type VoiceAnswer = ReturnType<typeof useVoiceAnswer>;

/** The answer textarea with read-aloud and dictation controls. */
export function VoiceAnswerField({
  id,
  label,
  answer,
  disabled,
}: {
  id: string;
  label: string;
  answer: VoiceAnswer;
  disabled: boolean;
}) {
  const { voice } = answer;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
          {label}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {voice.ttsSupported && (
            <button
              type="button"
              onClick={answer.readQuestion}
              disabled={disabled || voice.speaking}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {voice.speaking ? "🔊 Reading…" : "🔊 Read question"}
            </button>
          )}
          {voice.sttSupported && (
            <button
              type="button"
              onClick={answer.toggleListening}
              disabled={disabled}
              aria-pressed={voice.listening}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                voice.listening
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {voice.listening ? "⏹ Stop" : "🎤 Speak answer"}
            </button>
          )}
        </div>
      </div>

      {voice.listening && (
        <p className="mb-2 flex items-center gap-2 text-xs font-medium text-red-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
          Listening — speak your answer. You can edit the text at any time.
        </p>
      )}

      <textarea
        id={id}
        value={answer.value}
        onChange={(event) => answer.onChange(event.target.value)}
        rows={8}
        placeholder={
          voice.sttSupported
            ? "Type your answer, or press “Speak answer” to dictate it…"
            : "Type your answer here…"
        }
        disabled={disabled}
        className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
        <span>{answer.value.split(/\s+/).filter(Boolean).length} words</span>
        {!voice.sttSupported && <span>Voice answers work in Chrome or Edge</span>}
      </div>

      {voice.error && (
        <div className="mt-4">
          <InlineError message={voice.error} />
        </div>
      )}
    </>
  );
}
