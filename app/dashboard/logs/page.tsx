import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { getAuditLogs } from "@/lib/audit-log";
import { redirect } from "next/navigation";
import { LogsTable } from "@/components/logs/logs-table";
import PageContainer from "@/components/layout/page-container";

/**
 * Audit Logs Page
 * Displays system activity logs with filtering
 * Requires audit.read permission
 */
export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; resource?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check permission
  const hasAccess = await checkPermission("audit.read");
  if (!hasAccess) {
    redirect("/dashboard");
  }

  const { page: pageParam, action, resource } = await searchParams;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const filters = {
    action,
    resource,
  };

  const result = await getAuditLogs(page, 50, filters);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground mt-1">
              View system activity and user actions
            </p>
          </div>
        </div>

        <LogsTable
          logs={result.logs}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
        />
      </div>
    </PageContainer>
  );
}

