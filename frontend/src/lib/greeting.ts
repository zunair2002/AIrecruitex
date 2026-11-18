/**
 * "Hello" the first time someone uses the app after creating their account,
 * "Welcome back" on every later sign-in.
 *
 * The first session on this device is remembered in sessionStorage, so every
 * page in that session keeps saying "Hello"; the next session (a new sign-in)
 * finds the account in localStorage and says "Welcome back".
 */
const SEEN_KEY = "airecruitx_seen_users";
const FIRST_SESSION_KEY = "airecruitx_first_session_user";

export function greetingFor(user: { id: string; name: string } | null): string {
  const firstName = user?.name?.split(" ")[0] ?? "";
  if (!user || typeof window === "undefined") return `Welcome back, ${firstName}`;
  try {
    if (sessionStorage.getItem(FIRST_SESSION_KEY) === user.id) {
      return `Hello, ${firstName}`;
    }
    const seen: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    if (!seen.includes(user.id)) {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, user.id]));
      sessionStorage.setItem(FIRST_SESSION_KEY, user.id);
      return `Hello, ${firstName}`;
    }
  } catch {
    // Storage blocked — fall through to the returning-user greeting.
  }
  return `Welcome back, ${firstName}`;
}
