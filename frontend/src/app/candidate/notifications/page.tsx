import { NotificationsPanel } from "@/components/shared/NotificationsPanel";

export const metadata = {
  title: "Notifications | AIRecruitX Candidate",
  description: "Application updates, scheduled interviews and support replies",
};

export default function CandidateNotificationsPage() {
  return <NotificationsPanel />;
}
