import { BroadcastForm } from "@/components/admin/BroadcastForm";

export const metadata = {
  title: "Broadcast | AIRecruitX Admin",
  description: "Send a notification to a user or an entire role",
};

export default function AdminBroadcastFormPage() {
  return <BroadcastForm />;
}
