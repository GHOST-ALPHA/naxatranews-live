import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { CreateNewsForm } from "@/components/news/create-news-form";
import PageContainer from "@/components/layout/page-container";

/**
 * Create News Page
 */
export default async function CreateNewsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasCreateAccess = await checkPermission("news.create");
  if (!hasCreateAccess) {
    redirect("/dashboard/news");
  }

  const hasPublishPermission = await checkPermission("news.publish");
  const hasSubmitPermission = await checkPermission("news.submit");

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-2">
        <CreateNewsForm
          canPublish={hasPublishPermission}
          canSubmit={hasSubmitPermission}
        />
      </div>
    </PageContainer>
  );
}

