import type { Metadata } from "next";
import { DeactivatedScreen } from "./DeactivatedScreen";

export const metadata: Metadata = {
  title: "Account deactivated | AiRecruitex",
  description: "This account has been deactivated by an administrator.",
};

/**
 * Standalone page for a deactivated account.
 *
 * It is a route of its own rather than something rendered inside the login
 * card or the portal shell: the account is switched off, so showing it next to
 * a sign-in form (or beside a working sidebar) invites the user to try again
 * on a door that cannot open.
 */
export default function AccountDeactivatedPage() {
  return <DeactivatedScreen />;
}
