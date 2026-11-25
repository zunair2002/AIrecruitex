"use client";

import { useRef, useState, type DragEvent } from "react";
import { CircleAlert, FileUp } from "lucide-react";
import { RESUME_ACCEPT_ATTRIBUTE } from "@/lib/resumeApi";

type ResumeDropzoneProps = {
  onFileSelect: (file: File) => void;
  error: string | null;
  maxSizeMB: number;
};

export function ResumeDropzone({
  onFileSelect,
  error,
  maxSizeMB,
}: ResumeDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (file) onFileSelect(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Upload a PDF or DOCX resume"
      className={`group cursor-pointer rounded-xl border-2 border-dashed px-5 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:py-12 ${
        isDragging
          ? "border-brand-500 bg-brand-50"
          : error
            ? "border-rose-300 bg-rose-50/40 hover:border-rose-400"
            : "border-line bg-surface-2 hover:border-brand-300 hover:bg-brand-50/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={RESUME_ACCEPT_ATTRIBUTE}
        className="hidden"
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 ring-8 ring-brand-50">
        <FileUp aria-hidden="true" className="h-6 w-6" />
      </div>
      <p className="text-base font-semibold text-ink">
        <span className="text-brand-700">Click to upload</span> or drag and drop
      </p>
      <p className="mt-1 text-sm text-muted">
        PDF or DOCX · Maximum file size {maxSizeMB}MB
      </p>
      <span
        aria-hidden="true"
        className="mt-5 inline-flex h-10 items-center rounded-lg border border-line bg-white px-4 text-sm font-semibold text-body shadow-xs transition-colors group-hover:text-ink"
      >
        Choose file
      </span>
      {error && (
        <p className="mx-auto mt-4 flex max-w-md items-start justify-center gap-1.5 text-sm font-medium text-rose-600">
          <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
