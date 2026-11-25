"use client";

import { useEffect, useState } from "react";
import { Mic, Square, Volume2 } from "lucide-react";
import { useVoiceInterview } from "@/hooks/useVoiceInterview";
import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/ui/Feedback";
import { textareaClass } from "@/components/ui/controls";

const joinText = (base: string, spoken: string) =>
  [base.trim(), spoken.trim()].filter(Boolean).join(" ");

// Must match MAX_ANSWER_CHARS in the backend interview controller.
const MAX_ANSWER_CHARS = 5000;

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={id} className="block text-base font-semibold text-ink">
          {label}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {voice.ttsSupported && (
            <Button
              variant="secondary"
              onClick={answer.readQuestion}
              disabled={disabled || voice.speaking}
              leadingIcon={<Volume2 aria-hidden="true" />}
            >
              {voice.speaking ? "Reading…" : "Read question"}
            </Button>
          )}
          {voice.sttSupported && (
            <Button
              variant={voice.listening ? "danger" : "soft"}
              onClick={answer.toggleListening}
              disabled={disabled}
              aria-pressed={voice.listening}
              leadingIcon={
                voice.listening ? (
                  <Square aria-hidden="true" />
                ) : (
                  <Mic aria-hidden="true" />
                )
              }
            >
              {voice.listening ? "Stop" : "Speak answer"}
            </Button>
          )}
        </div>
      </div>

      {voice.listening && (
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-rose-700">
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full bg-brand-200 motion-safe:animate-pulse"
          />
          Listening — speak your answer. You can edit the text at any time.
        </p>
      )}

      <textarea
        id={id}
        value={answer.value}
        onChange={(event) => answer.onChange(event.target.value)}
        rows={8}
        maxLength={MAX_ANSWER_CHARS}
        placeholder={
          voice.sttSupported
            ? "Type your answer, or press “Speak answer” to dictate it…"
            : "Type your answer here…"
        }
        disabled={disabled}
        className={`${textareaClass} resize-none`}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums text-muted">
        <span>{answer.value.split(/\s+/).filter(Boolean).length} words</span>
        {!voice.sttSupported && <span>Voice answers work in Chrome or Edge</span>}
        <span>
          {answer.value.length}/{MAX_ANSWER_CHARS} characters
        </span>
      </div>

      {voice.error && (
        <div className="mt-4">
          <InlineError message={voice.error} />
        </div>
      )}
    </>
  );
}
