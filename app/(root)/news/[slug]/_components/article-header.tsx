"use client"

import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Clock, Share2, ArrowLeft } from "lucide-react"
import type { Article } from "@/constants/news-data"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArticleVideoEmbed } from "@/components/news/article-video-embed"

interface ArticleHeaderProps {
  article: Article
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  const router = useRouter();
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/news/${article.slug}` : ""
  const shareData = {
    url: shareUrl,
    title: article.title,
    description: article.excerpt,
    image: article.image,
  }
  return (
    <div className="mb-8 md:mb-12">
      <div className="flex justify-between items-center mb-4 sm:mb-6">

        {/* Breadcrumb */}
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground  overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="mx-2">»</span>
          <Link href={`/news/${article.category}`} className="hover:text-foreground capitalize transition-colors">
            {article.category}
          </Link>
          <span className="mx-2">»</span>
          <span className="text-foreground truncate max-w-[200px] sm:max-w-[300px]">{article.title}</span>
        </div>

        <div>
          <Button
            variant="link"
            size="icon"
            onClick={() => router.back()}
            className="flex gap-2 items-center"
          >
            <ArrowLeft />
            Back
          </Button>
        </div>


      </div>


      {/* Category Badge */}
      {/* <Badge variant="default" className="mb-4 sm:mb-6 bg-blue-500 hover:bg-blue-600 text-white uppercase rounded-sm text-xs sm:text-sm px-2 sm:px-3 py-1">
        {article.category}
      </Badge> */}

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-[1.2] mb-4 sm:mb-6 text-foreground tracking-tight font-hindi">{article.title}</h1>

      {/* Excerpt */}
      <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-[1.7] font-hindi">{article.excerpt}</p>

      {/* Meta Data Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-b border-border py-4 sm:py-5 mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
            <Image src="/assets/logo.png" alt={article.author} fill className="object-cover" />
          </div>
          <div className="flex flex-col text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground uppercase text-xs font-bold">BY</span>
              <span className="font-bold text-foreground uppercase">{article.author}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>{article.date}</span>
              {article.updatedDate && <span>• Updated: {article.updatedDate}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {/* <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{article.comments} Comments</span>
          </div> */}

          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{article.readTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none gap-2 text-xs h-9 sm:h-8 bg-transparent w-full justify-center"
            >
              <span className="font-semibold">Follow Us</span>
              <Image src="/assets/gnews.webp" alt="News" width={16} height={16} className="rounded-sm" />
            </Button>
          </div>
        </div>
      </div>



      {/* Main Media - Video or Image (Conditional) */}
      {article.video ? (
        // Show video if available
        <div className="mb-6 sm:mb-8">
          <ArticleVideoEmbed
            videoUrl={article.video}
            title={article.title}
            className="w-full"
          />
        </div>
      ) : article.image ? (
        // Show image if no video
        <div className="relative aspect-[16/9] w-full min-h-[200px] sm:min-h-[300px] md:min-h-[400px] overflow-hidden rounded-lg sm:rounded-xl shadow-lg mb-6 sm:mb-8 bg-muted/30">
          <Image
            src={article.image || "/assets/newsplaceholder.webp"}
            alt={article.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
          />
        </div>
      ) : null}
    </div>
  )
}
