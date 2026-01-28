
import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { getUsers, getUserStats } from "@/lib/actions/users";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/users/users-table";
import { UserStats } from "@/components/users/user-stats";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/layout/page-container";

/**
 * Users Management Page
 * Displays list of all users with pagination and search
 * Requires user.read permission
 */
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check permission
  const hasAccess = await checkPermission("user.read");
  if (!hasAccess) {
    redirect("/dashboard");
  }

  const { page: pageParam, search } = await searchParams;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const limit = 10;

  // Fetch users and stats in parallel
  const [result, statsResult] = await Promise.all([
    getUsers(page, limit, search),
    getUserStats(),
  ]);

  if (!result.success) {
    return (
      <div className="p-6">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  const totalPages = Math.ceil((result.total || 0) / limit);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage system users, roles, and permissions
            </p>
          </div>
          {await checkPermission("user.create") && (
            <Link href="/dashboard/users/new">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </Link>
          )}
        </div>

        {statsResult.success && statsResult.stats && <UserStats stats={statsResult.stats} />}

        <UsersTable
          users={result.users || []}
          total={result.total || 0}
          page={page}
          totalPages={totalPages}
          search={search}
        />
      </div>
    </PageContainer>
  );
}

