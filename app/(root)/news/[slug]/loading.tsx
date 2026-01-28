import { Skeleton } from "@/components/ui/skeleton"

export default function ArticleLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Article Header Skeleton */}
      <div className="space-y-6">
        {/* Breadcrumb-like */}
        <div className="flex gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <Skeleton className="h-8 sm:h-12 w-full" />
          <Skeleton className="h-8 sm:h-12 w-[90%]" />
          <Skeleton className="h-8 sm:h-12 w-[80%]" />
        </div>

        {/* Meta Row */}
        <div className="flex items-center justify-between border-y border-border py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Hero Image */}
        <Skeleton className="aspect-[16/9] w-full rounded-xl" />
      </div>

      {/* Content Area Skeleton */}
      <div className="flex gap-8">
        {/* Left Social Sidebar Skeleton (Desktop only) */}
        <div className="hidden lg:flex flex-col gap-4 w-12 shrink-0 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Main Text Content */}
        <div className="flex-1 space-y-6">
          {/* Paragraphs */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-full" />
          </div>

          <Skeleton className="h-64 w-full rounded-lg" /> {/* Inline image/ad mock */}

          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[98%]" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
