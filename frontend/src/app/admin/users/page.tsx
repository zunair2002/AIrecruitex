import { UserManagement } from "@/components/admin/UserManagement";

export const metadata = {
  title: "User Management | AiRecruitex Admin",
  description: "Search, deactivate, re-role and delete platform accounts",
};

export default function AdminUserManagementPage() {
  return <UserManagement />;
}
