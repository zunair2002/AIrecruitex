"use client";

import { useRef, useState, type DragEvent } from "react";
import { FileUp } from "lucide-react";
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
      className={`cursor-pointer rounded border border-dashed px-4 py-8 text-center transition-colors sm:py-9 ${
        isDragging
          ? "border-[#6b5ce7] bg-[#f7f6ff]"
          : "border-[#c9c4f1] bg-white hover:border-[#6b5ce7] hover:bg-[#fcfbff]"
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
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f0efff] text-[#6658d9]">
        <FileUp aria-hidden="true" className="h-4 w-4" />
      </div>
      <p className="text-[12px] font-semibold text-[#454752]">
        <span className="text-[#6658d9]">Click to upload</span> or drag and drop
      </p>
      <p className="mt-1.5 text-[9px] text-[#92949d]">
        PDF or DOCX · Maximum file size {maxSizeMB}MB
      </p>
      {error && (
        <p className="mt-3 text-[10px] font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
