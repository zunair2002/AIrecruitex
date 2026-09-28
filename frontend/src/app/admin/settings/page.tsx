import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = {
  title: "Settings | AiRecruitex Admin",
  description: "Site name, match threshold, signups and resume size limit",
};

export default function AdminSettingsFormPage() {
  return <SettingsForm />;
}
