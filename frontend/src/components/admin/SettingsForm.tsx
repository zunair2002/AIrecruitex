"use client";

import { useState, type ReactNode } from "react";
import { Save, Settings2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toErrorMessage } from "@/lib/api";
import { getSettings, updateSettings } from "@/lib/adminApi";
import { useApiResource } from "@/lib/useApiResource";
import { formatDateTime } from "@/lib/format";
import type { Settings } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import {
  Card,
  ErrorBlock,
  InlineError,
  InlineSuccess,
  LoadingBlock,
  PageHeader,
} from "@/components/ui/Feedback";
import { inputClass } from "@/components/ui/controls";
import { PortalPage } from "@/components/dashboard/primitives";

/**
 * Accessible on/off switch (role="switch"). Label it with a `<label htmlFor>`
 * pointing at `id`, or pass `label`.
 */
export function ToggleSwitch({
  checked,
  onChange,
  id,
  label,
  describedBy,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  id?: string;
  label?: string;
  describedBy?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-brand-700" : "bg-line"
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-xs ring-1 ring-ink/5 transition-transform ${
          checked ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/** Label + description on the left, control on the right (stacked on phones). */
function SettingRow({
  label,
  htmlFor,
  description,
  descriptionId,
  children,
}: {
  label: string;
  htmlFor: string;
  description: ReactNode;
  descriptionId: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 py-5 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
      <div className="min-w-0">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
        </label>
        <p id={descriptionId} className="mt-1 text-sm text-muted">
          {description}
        </p>
      </div>
      <div className="min-w-0 md:pt-0.5">{children}</div>
    </div>
  );
}

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

  if (settings.isLoading) {
    return (
      <PortalPage>
        <LoadingBlock label="Loading settings…" />
      </PortalPage>
    );
  }
  if (settings.error) {
    return (
      <PortalPage>
        <ErrorBlock message={settings.error} onRetry={settings.reload} />
      </PortalPage>
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
    <PortalPage>
      <PageHeader
        icon={<Settings2 />}
        title="Platform settings"
        description="The single global settings document the backend reads at runtime."
      />

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {error && <InlineError message={error} />}
        {success && <InlineSuccess message={success} />}

        <Card
          title="General"
          description="How the platform presents itself and who can join."
        >
          <div className="divide-y divide-line-soft">
            <SettingRow
              label="Site name"
              htmlFor="settings-site-name"
              descriptionId="settings-site-name-help"
              description="The platform name stored on the settings document."
            >
              <input
                id="settings-site-name"
                type="text"
                value={siteName}
                onChange={(event) => setSiteName(event.target.value)}
                aria-describedby="settings-site-name-help"
                className={inputClass}
              />
            </SettingRow>

            <SettingRow
              label="Allow new sign-ups"
              htmlFor="settings-allow-signups"
              descriptionId="settings-allow-signups-help"
              description="Stored on the settings document for the platform's sign-up policy."
            >
              <div className="flex items-center gap-3 md:justify-end">
                <span className="text-sm text-body" aria-hidden="true">
                  {allowSignups ? "On" : "Off"}
                </span>
                <ToggleSwitch
                  id="settings-allow-signups"
                  checked={allowSignups}
                  onChange={setAllowSignups}
                  describedBy="settings-allow-signups-help"
                />
              </div>
            </SettingRow>
          </div>
        </Card>

        <Card
          title="Matching and uploads"
          description="Rules applied when candidates apply to jobs."
        >
          <div className="divide-y divide-line-soft">
            <SettingRow
              label="Match threshold"
              htmlFor="settings-threshold"
              descriptionId="settings-threshold-help"
              description="An application is flagged as matched when its match score reaches this percentage. Applied at apply time — existing applications keep the flag they were given."
            >
              <div className="flex items-center gap-4">
                <input
                  id="settings-threshold"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={matchThreshold}
                  onChange={(event) =>
                    setMatchThreshold(Number(event.target.value))
                  }
                  aria-describedby="settings-threshold-help"
                  className="h-2 min-w-0 flex-1 cursor-pointer accent-brand-700"
                />
                <span className="inline-flex h-9 min-w-16 items-center justify-center rounded-lg border border-line bg-surface-2 px-2 text-sm font-semibold text-ink tabular-nums">
                  {matchThreshold}%
                </span>
              </div>
              <div className="mt-1 flex justify-between pr-20 text-xs text-muted tabular-nums">
                <span>0%</span>
                <span>100%</span>
              </div>
            </SettingRow>

            <SettingRow
              label="Max resume size"
              htmlFor="settings-resume-size"
              descriptionId="settings-resume-size-help"
              description="Stored for reference — the upload middleware's own 5MB limit applies to actual uploads."
            >
              <div className="relative w-full sm:w-40 md:ml-auto">
                <input
                  id="settings-resume-size"
                  type="number"
                  min={1}
                  max={50}
                  value={maxResumeSizeMB}
                  onChange={(event) =>
                    setMaxResumeSizeMB(Number(event.target.value))
                  }
                  aria-describedby="settings-resume-size-help"
                  className={`${inputClass} pr-12 tabular-nums`}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted"
                >
                  MB
                </span>
              </div>
            </SettingRow>
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-3 rounded-xl border border-line bg-surface px-5 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-muted">
            Last updated {formatDateTime(settings.updatedAt)}
          </p>
          <Button type="submit" loading={isSaving} leadingIcon={<Save />}>
            {isSaving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
    </PortalPage>
  );
}
