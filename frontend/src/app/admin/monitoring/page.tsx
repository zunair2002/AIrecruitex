import { Monitoring } from "@/components/admin/Monitoring";

export const metadata = {
  title: "Monitoring | AiRecruitex Admin",
  description: "Database state, uptime and recent server errors",
};

export default function AdminMonitoringPage() {
  return <Monitoring />;
}
