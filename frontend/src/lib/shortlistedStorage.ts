"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "airecruitx_shortlisted_ids";
export const SHORTLIST_UPDATED_EVENT = "shortlist-updated";

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SHORTLIST_UPDATED_EVENT));
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getSnapshot() {
  return JSON.stringify(readIds());
}

function getServerSnapshot() {
  return "[]";
}

/** Subscribe to shortlist changes — snapshot is the stored id list. */
export function useShortlistSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function getShortlistedIds(): string[] {
  return readIds();
}

export function isApplicantShortlisted(applicantId: string, defaultShortlisted = false) {
  const ids = readIds();
  if (ids.includes(applicantId)) return true;
  if (ids.includes(`removed:${applicantId}`)) return false;
  return defaultShortlisted;
}

export function shortlistApplicant(applicantId: string) {
  const ids = readIds().filter((id) => id !== `removed:${applicantId}`);
  if (!ids.includes(applicantId)) ids.push(applicantId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  notifyListeners();
}

export function removeFromShortlist(applicantId: string) {
  const ids = readIds().filter((id) => id !== applicantId);
  if (!ids.includes(`removed:${applicantId}`)) {
    ids.push(`removed:${applicantId}`);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  notifyListeners();
}
