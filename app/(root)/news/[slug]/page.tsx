import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getNewsBySlug, getRelatedNews } from "@/lib/actions/news"
import { lexicalToHTML } from "@/lib/utils/lexical-to-html"
import { mapToArticle } from "@/lib/utils/news-mapper-unified"
import { getBestOGImage } from "@/lib/utils/og-image"
import { ArticleHeader } from "./_components/article-header"
import { ArticleContent } from "./_components/article-content"
import { AuthorBio } from "./_components/author-bio"
import { RelatedPosts } from "./_components/related-posts"
import { TrackView } from "./_components/track-view"
import type { Article } from "@/constants/news-data"
import dynamic from "next/dynamic"

// Dynamic Components for Performance
const CommentsSection = dynamic(() => import("./_components/comments-section").then(mod => mod.CommentsSection), {
  loading: () => <div className="w-full h-32 bg-muted/5 animate-pulse my-8" />
})

const SocialSidebar = dynamic(() => import("./_components/social-sidebar").then(mod => mod.SocialSidebar), {
  ssr: true, // Keep sidebar SSR for layout, but can be prioritized lower? actually sticky needs to be there. Let's keep it default or simple.
  // Actually, social buttons are client interaction heavily. Let's lazy load it.
  loading: () => <div className="w-12 h-64 bg-muted/5 animate-pulse hidden lg:block sticky top-24" />
})

const AdInline = dynamic(() => import("@/components/ads/ad-inline").then(mod => mod.AdInline), {
  loading: () => <div className="w-full h-32 bg-muted/5 animate-pulse my-12" />
})

export const revalidate = 60; // ISR: Revalidate every 60 seconds
export const dynamicParams = true; // Allow rendering of slugs not pre-generated

// Generate static params for the top 100 latest news for pre-rendering
export async function generateStaticParams() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const latestNews = await prisma.news.findMany({
      where: { isPublished: true, isActive: true },
      select: { slug: true },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    });

    return latestNews.map((news) => ({
      slug: news.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

// Helper to sanitize text for JSON-LD
const sanitizeForJsonLd = (text: string) => {
  return text?.replace(/"/g, '\\"').replace(/\n/g, ' ') || "";
}

// Map database news to Article interface
// Uses unified mapper with Lexical content conversion
function mapNewsToArticle(news: any): Article {
  // Use unified mapper for base mapping
  const article = mapToArticle(news);

  // Convert Lexical JSON to HTML if content exists
  if (news.content) {
    const htmlContent = lexicalToHTML(news.content);
    article.content = htmlContent;
    article.fullContent = htmlContent;
    // Recalculate read time based on actual content
    article.readTime = `${Math.ceil((htmlContent.length || 1000) / 500)} Mins Read`;
  }

  // Add meta keywords as tags if available
  if (news.metaKeywords) {
    article.tags = news.metaKeywords.split(",").map((tag: string) => tag.trim());
  }

  // Add comment count if available
  if (news._count?.comments !== undefined) {
    article.comments = news._count.comments;
  }

  // Add video URL if available
  if (news.coverVideo) {
    article.video = news.coverVideo;
  }

  return article;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getNewsBySlug(slug)

  if (!result.success || !result.news) {
    return {
      title: "News Not Found",
      description: "The requested news article could not be found.",
    }
  }

  const news = result.news
  const title = news.metaTitle || news.title
  const description = news.metaDescription || news.excerpt || ""
  const image = getBestOGImage({
    ogImage: news.ogImage,
    coverImage: news.coverImage,
    coverVideo: news.coverVideo,
  })

  // Get base URL from environment or use default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.naxatranewshindi.com"
  const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`
  const canonicalUrl = `${baseUrl}/news/${news.slug}`;
  const categoryName = news.categories?.[0]?.menu?.name || "News";

  // Tags/Keywords
  const keywords = news.metaKeywords
    ? news.metaKeywords.split(",").map((k: string) => k.trim())
    : [categoryName, "Latest News", "Hindi News"];

  return {
    title,
    description,
    authors: [{ name: news.author?.username || "Naxatra News Team" }],
    openGraph: {
      title,
      description,
      images: [{ url: fullImageUrl, width: 1200, height: 630, alt: title }],
      type: "article",
      url: canonicalUrl,
      publishedTime: news.publishedAt ? new Date(news.publishedAt).toISOString() : undefined,
      modifiedTime: news.updatedAt ? new Date(news.updatedAt).toISOString() : undefined,
      section: categoryName,
      authors: news.author ? [news.author.username] : ["Naxatra News Team"],
      tags: keywords,
      siteName: "Naxatra News", // BRANDING
      locale: "hi_IN",
      alternateLocale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullImageUrl],
      creator: "@NaxatraNews", // Replace with actual handle
      site: "@NaxatraNews",
    },
    keywords: keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params

  // Fetch news from database
  const result = await getNewsBySlug(slug)

  if (!result.success || !result.news) {
    notFound()
  }

  const article = mapNewsToArticle(result.news)
  const newsItem = result.news;

  // SEO Helper Data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.naxatranewshindi.com"
  const canonicalUrl = `${baseUrl}/news/${newsItem.slug}`;
  const imageUrl = getBestOGImage({
    ogImage: newsItem.ogImage,
    coverImage: newsItem.coverImage,
  });
  const fullImageUrl = imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`;
  const datePublished = newsItem.publishedAt ? new Date(newsItem.publishedAt).toISOString() : new Date().toISOString();
  const dateModified = newsItem.updatedAt ? new Date(newsItem.updatedAt).toISOString() : datePublished;

  // Author Data for Schema
  const authorName = newsItem.author ? (newsItem.author.firstName ? `${newsItem.author.firstName} ${newsItem.author.lastName || ''}`.trim() : newsItem.author.username) : "Naxatra News Team";
  const authorUrl = newsItem.author ? `${baseUrl}/author/${newsItem.author.username}` : baseUrl;

  // JSON-LD Schema (NewsArticle)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": sanitizeForJsonLd(newsItem.title),
    "image": [fullImageUrl],
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": [{
      "@type": "Person",
      "name": authorName,
      "url": authorUrl
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Naxatra News",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/assets/logo.png`
      }
    },
    "description": sanitizeForJsonLd(newsItem.excerpt || ""),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };


  // Get related articles
  const categoryIds = newsItem.categories?.map((cat: any) => cat.menuId) || []
  const relatedResult = await getRelatedNews(slug, categoryIds, 3)
  const relatedPosts = relatedResult.success && relatedResult.news
    ? relatedResult.news.map(mapNewsToArticle)
    : []

  return (
    <div className="relative">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Track view count - invisible component */}
      <TrackView newsId={newsItem.id} />

      {/* Article Header includes the Hero Image. We place it full width at the top. */}
      <ArticleHeader article={article} />

      {/* 
        SECTION 1: Content + Sticky Sidebar 
        This wrapper contains ONLY the text content and the social sidebar.
        This ensures the "sticky" track ends exactly when the content ends.
      */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 relative">
        {/* Sticky Social Sidebar (Left) - Only visible alongside content */}
        <div className="hidden lg:block shrink-0 w-12">
          <div className="sticky top-24">
            <SocialSidebar />
          </div>
        </div>

        {/* Article Body (Right) */}
        <div className="flex-1 min-w-0">
          <ArticleContent content={article.fullContent || article.content} />

          {/* Inline Ad after content */}
          <div className="my-12">
            <AdInline showDefault={true} />
          </div>
        </div>
      </div>

      {/* 
        SECTION 2: Footer Components (Bio, Related, Comments)
        We start a new flex container here. We replicate the left "spacer" 
        so that these components align perfectly with the text above, 
        but without the social sidebar sticking next to them.
      */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 relative mt-10 pt-10 border-t border-border">
        {/* Spacer to maintain alignment with the content above */}
        <div className="hidden lg:block shrink-0 w-12" aria-hidden="true" />

        <div className="flex-1 min-w-0">
          <AuthorBio author={article.author} />

          <RelatedPosts posts={relatedPosts} />

          <CommentsSection newsId={newsItem.id} count={newsItem.commentCount || article.comments || 0} />
        </div>
      </div>
    </div>
  )
}

