"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ContactFormData, ContactMode } from "./contactData";
import { emptyContactForm } from "./contactData";

type ContactFormProps = {
  activeMode: ContactMode;
  formData: ContactFormData;
  isLoading: boolean;
  isSubmitted: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export const ContactForm = ({
  activeMode,
  formData,
  isLoading,
  isSubmitted,
  onInputChange,
  onSubmit,
}: ContactFormProps) => {
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="form-success bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <motion.svg
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </motion.svg>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h3>
        <p className="text-gray-600">We&apos;ll be in touch within 24 hours.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      <input type="hidden" name="type" value={activeMode} />
      {[
        { id: "name", label: "Name", type: "text", required: true, placeholder: "Your name" },
        { id: "email", label: "Email", type: "email", required: true, placeholder: "you@company.com" },
        { id: "company", label: "Company", type: "text", required: false, placeholder: "Your company name" },
      ].map((field) => (
        <div key={field.id} className="form-group mb-5">
          <label htmlFor={field.id} className="block text-sm font-semibold text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={field.type}
            id={field.id}
            name={field.id}
            required={field.required}
            value={formData[field.id as keyof ContactFormData]}
            onChange={onInputChange}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      ))}
      <div className="form-group mb-6">
        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={onInputChange}
          placeholder="Tell us about your hiring needs..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="form-submit w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
        ) : (
          "Send Request"
        )}
      </button>
    </form>
  );
};

export function useContactForm() {
  const [activeMode, setActiveMode] = useState<ContactMode>("demo");
  const [formData, setFormData] = useState(emptyContactForm);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleModeChange = (mode: ContactMode) => {
    setActiveMode(mode);
    setIsSubmitted(false);
    setFormData(emptyContactForm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return {
    activeMode,
    formData,
    isSubmitted,
    isLoading,
    handleModeChange,
    handleInputChange,
    handleSubmit,
  };
}
