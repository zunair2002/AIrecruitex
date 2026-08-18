"use client";

import { useRef, useState, type DragEvent } from "react";

const MAX_SIZE_MB = 5;

type ResumeDropzoneProps = {
  onFileSelect: (file: File) => void;
  error: string | null;
};

export function ResumeDropzone({ onFileSelect, error }: ResumeDropzoneProps) {
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
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl">
        📄
      </div>
      <p className="text-lg font-semibold text-gray-900">
        Drag & drop your resume here
      </p>
      <p className="text-sm text-gray-500 mt-2">
        or click to browse — PDF only, max {MAX_SIZE_MB}MB
      </p>
      {error && <p className="text-sm text-red-600 mt-4 font-medium">{error}</p>}
    </div>
  );
}
