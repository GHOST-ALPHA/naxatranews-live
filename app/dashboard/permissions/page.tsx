import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { getPermissions } from "@/lib/actions/permissions";
import { redirect } from "next/navigation";
import { PermissionsTable } from "@/components/permissions/permissions-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/layout/page-container";

/**
 * Permissions Management Page
 * Displays list of all permissions grouped by resource
 * Requires permission.read permission
 */
export default async function PermissionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check permission
  const hasAccess = await checkPermission("permission.read");
  if (!hasAccess) {
    redirect("/dashboard");
  }

  const result = await getPermissions();

  if (!result.success) {
    return (
      <div className="p-6">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage system permissions and access control
            </p>
          </div>
          {await checkPermission("permission.create") && (
            <Link href="/dashboard/permissions/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Permission
              </Button>
            </Link>
          )}
        </div>

        <PermissionsTable permissions={result.permissions || []} />
      </div>
    </PageContainer>
  );
}

