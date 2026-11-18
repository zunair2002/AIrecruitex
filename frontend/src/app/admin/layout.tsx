import { AdminShell } from "@/components/admin/AdminSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

/**
 * Same shell as the candidate and HR portals (`PortalShell`): a fixed sidebar
 * on desktop, a top bar + slide-in drawer on smaller screens, and a
 * window-scrolling content column.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth roles={["admin"]} loginPath="/login/recruiter">
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
