import { ActivityLog } from "@/components/admin/ActivityLog";

export const metadata = {
  title: "Activity Log | AIRecruitX Admin",
  description: "Audit trail of every recorded admin action",
};

export default function AdminActivityLogPage() {
  return <ActivityLog />;
}
