"use client";

import { useRef, useState, type DragEvent } from "react";
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
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
        isDragging
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={RESUME_ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
        📄
      </div>
      <p className="text-lg font-semibold text-gray-900">
        Drag &amp; drop your resume here
      </p>
      <p className="mt-2 text-sm text-gray-500">
        or click to browse — PDF or DOCX, max {maxSizeMB}MB
      </p>
      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
