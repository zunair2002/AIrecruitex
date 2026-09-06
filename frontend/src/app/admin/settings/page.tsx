import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = {
  title: "Settings | AIRecruitX Admin",
  description: "Site name, match threshold, signups and resume size limit",
};

export default function AdminSettingsFormPage() {
  return <SettingsForm />;
}
