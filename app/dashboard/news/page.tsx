import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { getUserNews, getUserNewsStats } from "@/lib/actions/news";
import { redirect } from "next/navigation";
import { NewsTable } from "@/components/news/news-table";
import { NewsStats } from "@/components/news/news-stats";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/layout/page-container";

/**
 * News Management Page
 * Shows user's own news posts (or all posts if has news.read.all permission)
 */
export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check if user has news.create permission
  const hasCreateAccess = await checkPermission("news.create");
  if (!hasCreateAccess) {
    redirect("/dashboard");
  }

  const { page: pageParam, search } = await searchParams;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 30) || 1) : 1;

  const hasReviewPermission = await checkPermission("news.review");

  // Fetch news and stats in parallel
  const [result, statsResult] = await Promise.all([
    getUserNews(page, 30, search),
    getUserNewsStats(),
  ]);


  if (!result.success) {
    return (
      <div className="p-6">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your news posts for Bawal News
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {hasReviewPermission && (
              <Link href="/dashboard/news/pending" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Pending Review
                </Button>
              </Link>
            )}
            <Link href="/dashboard/news/new" className="flex-1 sm:flex-none">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create News
              </Button>
            </Link>
          </div>
        </div>

        {statsResult.success && statsResult.stats && <NewsStats stats={statsResult.stats} />}

        <NewsTable
          news={result.news}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          search={search}
        />
      </div>
    </PageContainer>
  );
}

