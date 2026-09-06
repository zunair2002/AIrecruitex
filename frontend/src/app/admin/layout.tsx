import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth roles={["admin"]} loginPath="/login/recruiter">
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </RequireAuth>
  );
}
