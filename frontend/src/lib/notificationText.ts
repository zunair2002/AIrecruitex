/**
 * Splitting a notification into a subject and a body.
 *
 * The backend's Notification model stores a single `message` string — there is
 * no subject column — so the list derives one rather than printing the whole
 * paragraph on every row. Two things write notifications today:
 *
 *   support-desk.service.ts  `Your support ticket "X" was resolved: <reply>`
 *   notification-broadcast   free text an admin typed
 *
 * The first has a natural split at the colon; the rest fall back to the first
 * sentence. Everything here is presentation only — nothing is stored, so if the
 * backend ever adds a real subject field this can simply defer to it.
 */

const MAX_SUBJECT_LENGTH = 90;

export type NotificationText = {
  subject: string;
  /** The remainder, empty when the subject already says everything. */
  body: string;
};

export function splitNotification(message: string): NotificationText {
  const text = message.trim();
  if (!text) return { subject: "Notification", body: "" };

  // "Your support ticket "X" was resolved: <admin reply>"
  const resolved = text.match(/^(.*?\bwas resolved)\s*:\s*([\s\S]+)$/i);
  if (resolved) {
    return { subject: resolved[1].trim(), body: resolved[2].trim() };
  }

  // Otherwise the first sentence becomes the subject, when there is more after
  // it. The lookahead keeps the terminator on the subject.
  const sentence = text.match(/^([\s\S]{1,200}?[.!?])\s+([\s\S]+)$/);
  if (sentence && sentence[1].length <= MAX_SUBJECT_LENGTH) {
    return { subject: sentence[1].trim(), body: sentence[2].trim() };
  }

  if (text.length <= MAX_SUBJECT_LENGTH) {
    return { subject: text, body: "" };
  }

  // One long run-on line: cut at the last word boundary that fits.
  const cut = text.lastIndexOf(" ", MAX_SUBJECT_LENGTH);
  const splitAt = cut > 40 ? cut : MAX_SUBJECT_LENGTH;
  return {
    subject: `${text.slice(0, splitAt).trim()}…`,
    body: text.slice(splitAt).trim(),
  };
}
