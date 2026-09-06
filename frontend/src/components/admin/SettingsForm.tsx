"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { getSettings, updateSettings } from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDateTime } from "@/lib/format";
import type { Settings } from "@/lib/types";
import {
  Card,
  ErrorBlock,
  InlineError,
  InlineSuccess,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/controls";

/**
 * GET + PATCH /api/admin/settings — the four fields on the singleton settings
 * document. `matchThreshold` is the percentage an application's match score
 * must reach for `matched` to be true, so changing it changes shortlisting.
 */
export function SettingsForm() {
  const { token } = useAuth();
  const settings = useApiResource(
    (signal) => getSettings(token, signal),
    [token],
    { enabled: Boolean(token) },
  );

  if (settings.isLoading) return <LoadingBlock label="Loading settings…" />;
  if (settings.error) {
    return (
      <div className="p-8">
        <ErrorBlock message={settings.error} onRetry={settings.reload} />
      </div>
    );
  }
  if (!settings.data) return null;

  // Keyed on the document's own timestamp so the fields re-seed from a fresh
  // load without an effect that copies server state into form state.
  return (
    <SettingsFields
      key={settings.data.updatedAt}
      settings={settings.data}
      onSaved={settings.setData}
    />
  );
}

function SettingsFields({
  settings,
  onSaved,
}: {
  settings: Settings;
  onSaved: (next: Settings) => void;
}) {
  const { token } = useAuth();
  const [siteName, setSiteName] = useState(settings.siteName);
  const [matchThreshold, setMatchThreshold] = useState(settings.matchThreshold);
  const [allowSignups, setAllowSignups] = useState(settings.allowSignups);
  const [maxResumeSizeMB, setMaxResumeSizeMB] = useState(
    settings.maxResumeSizeMB,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      onSaved(
        await updateSettings(
          {
            siteName: siteName.trim(),
            matchThreshold: Number(matchThreshold),
            allowSignups,
            maxResumeSizeMB: Number(maxResumeSizeMB),
          },
          token,
        ),
      );
      setSuccess("Settings saved.");
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title="Platform Settings"
          description="The single global settings document the backend reads at runtime."
        />

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <InlineError message={error} />}
            {success && <InlineSuccess message={success} />}

            <div>
              <label htmlFor="settings-site-name" className={labelClass}>
                Site name
              </label>
              <input
                id="settings-site-name"
                type="text"
                value={siteName}
                onChange={(event) => setSiteName(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="settings-threshold" className={labelClass}>
                Match threshold ({matchThreshold}%)
              </label>
              <input
                id="settings-threshold"
                type="range"
                min={0}
                max={100}
                step={1}
                value={matchThreshold}
                onChange={(event) => setMatchThreshold(Number(event.target.value))}
                className="w-full accent-indigo-600"
              />
              <p className="mt-2 text-xs text-gray-400">
                An application is flagged as matched when its match score reaches
                this percentage. Applied at apply time — existing applications
                keep the flag they were given.
              </p>
            </div>

            <div>
              <label htmlFor="settings-resume-size" className={labelClass}>
                Max resume size (MB)
              </label>
              <input
                id="settings-resume-size"
                type="number"
                min={1}
                max={50}
                value={maxResumeSizeMB}
                onChange={(event) => setMaxResumeSizeMB(Number(event.target.value))}
                className={inputClass}
              />
              <p className="mt-2 text-xs text-gray-400">
                Stored for reference — the upload middleware&apos;s own 5MB limit
                applies to actual uploads.
              </p>
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={allowSignups}
                onChange={(event) => setAllowSignups(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  Allow new sign-ups
                </span>
                <span className="block text-xs text-gray-400">
                  Stored on the settings document for the platform&apos;s sign-up policy.
                </span>
              </span>
            </label>

            <div className="flex items-center gap-4">
              <button type="submit" disabled={isSaving} className={primaryButtonClass}>
                {isSaving ? "Saving…" : "Save settings"}
              </button>
              <p className="text-xs text-gray-400">
                Last updated {formatDateTime(settings.updatedAt)}
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
