import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { getPendingNews } from "@/lib/actions/news";
import { redirect } from "next/navigation";
import { PendingNewsTable } from "@/components/news/pending-news-table";
import PageContainer from "@/components/layout/page-container";

/**
 * Pending News Review Page
 * Only accessible to users with news.review permission (Superadmin/Editor)
 */
export default async function PendingNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check if user has news.review permission
  const hasReviewAccess = await checkPermission("news.review");
  if (!hasReviewAccess) {
    redirect("/dashboard/news");
  }

  const { page: pageParam, search } = await searchParams;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;

  const result = await getPendingNews(page, 30, search);

  if (!result.success) {
    return (
      <PageContainer>
        <div className="p-6">
          <p className="text-destructive">{result.error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-2">
        <div>
          <h1 className="text-3xl font-bold">Pending News Review</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve news posts submitted by contributors
          </p>
        </div>

        <PendingNewsTable
          news={result.news || []}
          total={result.total || 0}
          page={result.page || 1}
          totalPages={result.totalPages || 1}
          search={search}
        />
      </div>
    </PageContainer>
  );
}

