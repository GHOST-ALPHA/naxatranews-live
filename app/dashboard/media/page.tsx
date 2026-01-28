import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth/jwt-server"
import { checkPermission } from "@/lib/auth/permissions"
import { getUserMedia } from "@/lib/actions/media"
import { redirect } from "next/navigation"
import { MediaLibrary } from "@/components/media/media-library"
import PageContainer from "@/components/layout/page-container"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Media Management Page
 * Advanced media library with grid/list views, search, filters
 */
export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; type?: string; view?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const hasUploadAccess = await checkPermission("media.upload")
  if (!hasUploadAccess) {
    redirect("/dashboard")
  }

  const { page: pageParam, search, view, type } = await searchParams
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1
  const viewMode = (view as "grid" | "list") || "grid"

  const filters: any = {}
  if (type) {
    filters.resourceType = type as "image" | "video" | "raw"
  }

  const result = await getUserMedia(page, 24, search, filters)

  return (
    <PageContainer>
      <Suspense fallback={<MediaLibrarySkeleton />}>
        <MediaLibrary
          media={result.success ? result.media : []}
          total={result.success ? result.total : 0}
          page={result.success ? result.page : 1}
          totalPages={result.success ? result.totalPages : 1}
          search={search}
          viewMode={viewMode}
          error={!result.success ? result.error : undefined}
        />
      </Suspense>
    </PageContainer>
  )
}

function MediaLibrarySkeleton() {
  return (
    <div className="space-y-6 pt-6">
      <div className="flex justify-between items-center px-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24 hidden md:block" />
      </div>
      <div className="px-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  )
}
