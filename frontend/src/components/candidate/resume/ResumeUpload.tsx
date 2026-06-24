"use client";

import { useState } from "react";
import { ResumeDropzone } from "./ResumeDropzone";

const MAX_SIZE_MB = 5;

const mockParsed = {
  name: "Jane Doe",
  email: "jane.doe@email.com",
  skills: ["React", "TypeScript", "Node.js", "MongoDB", "Git"],
  experience: "3 years - Frontend Developer",
};

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ResumeUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    setUploaded(false);
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB.`);
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploaded(true);
    }, 1500);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploaded(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Resume Upload</h1>
          <p className="text-gray-500 mt-1">
            Upload your PDF resume. AI will parse it for interview preparation.
          </p>
        </div>

        {uploaded && selectedFile ? (
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
                OK
              </div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-800">Resume uploaded successfully!</p>
                <p className="text-sm text-gray-600 mt-1">{selectedFile.name}</p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Replace
              </button>
            </div>
          </div>
        ) : (
          <>
            <ResumeDropzone onFileSelect={handleFileSelect} error={error} />

            {selectedFile && (
              <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-lg">
                    PDF
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatSize(selectedFile.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {isUploading ? "Uploading..." : "Upload Resume"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {uploaded && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Parsed Resume Preview</h2>
            <p className="text-xs text-gray-400 mb-4">
              Mock data - real parsing will connect to backend later
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                <p className="font-semibold text-gray-900 mt-1">{mockParsed.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                <p className="font-semibold text-gray-900 mt-1">{mockParsed.email}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 sm:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Experience</p>
                <p className="font-semibold text-gray-900 mt-1">{mockParsed.experience}</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 sm:col-span-2">
                <p className="text-xs text-indigo-500 uppercase tracking-wide">Skills Detected</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mockParsed.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-white text-indigo-700 text-xs font-medium rounded-full border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
