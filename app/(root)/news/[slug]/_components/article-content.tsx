"use client"

import { cn } from "@/lib/utils"
import { useEffect, useCallback, memo } from "react"

// Type declaration for Twitter widget
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void
        createTweet: (id: string, container: HTMLElement) => Promise<void>
      }
    }
  }
}

interface ArticleContentProps {
  content: string
}

function ArticleContentComponent({ content }: ArticleContentProps) {
  // Memoize error handler to prevent recreation on each render
  const handleImageError = useCallback(function (this: HTMLImageElement) {
    // Fix: Check if parentNode exists before accessing it
    if (!this.parentNode) return;

    this.style.display = 'none'
    const errorDiv = document.createElement('div')
    errorDiv.className = 'flex items-center justify-center p-4 bg-muted rounded-lg my-4 border border-border'
    errorDiv.innerHTML = '<p class="text-sm text-muted-foreground">Image could not be loaded</p>'
    this.parentNode.replaceChild(errorDiv, this)
  }, [])

  // Enhance images and ensure proper rendering (production-optimized)
  useEffect(() => {
    const contentDiv = document.querySelector('.lexical-content')
    if (!contentDiv) return

    // Process images to ensure they're compact and responsive (news-style, production-ready)
    // Using CSS-only approach for better performance and stability
    const images = contentDiv.querySelectorAll('img.lexical-image, img')
    images.forEach((img) => {
      const imgElement = img as HTMLImageElement
      if (!imgElement.dataset.processed) {
        imgElement.dataset.processed = 'true'

        // Add loading="lazy" for performance
        imgElement.loading = 'lazy';

        // Core responsive styles handled via class, but ensure inline defaults dont break it
        imgElement.style.height = 'auto'
        imgElement.style.maxWidth = '100%'

        // Handle image errors gracefully (production-ready error handling)
        imgElement.onerror = handleImageError
      }
    })

    // Add responsive wrapper to tables
    const tables = contentDiv.querySelectorAll('table')
    tables.forEach((table) => {
      // Fix: Check if parentNode exists before accessing it
      if (!table.parentElement?.classList.contains('table-wrapper') && table.parentNode) {
        const wrapper = document.createElement('div')
        wrapper.className = 'table-wrapper overflow-x-auto my-6 sm:my-8 border border-border rounded-lg shadow-sm'
        table.parentNode.insertBefore(wrapper, table)
        wrapper.appendChild(table)
      }
    })

    // Load Twitter/X embeds (optimized: check if already loading)
    const tweetEmbeds = contentDiv.querySelectorAll('.twitter-tweet, [data-tweet-id]')
    if (tweetEmbeds.length > 0) {
      // Check if Twitter widget script is already loaded or loading
      if (!window.twttr && !document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
        const script = document.createElement('script')
        script.src = 'https://platform.twitter.com/widgets.js'
        script.async = true
        script.charset = 'utf-8'
        script.defer = true
        document.body.appendChild(script)
        script.onload = () => {
          if (window.twttr?.widgets) {
            window.twttr.widgets.load()
          }
        }
      } else if (window.twttr?.widgets) {
        window.twttr.widgets.load()
      }
    }
  }, [content, handleImageError])

  return (
    <>
      <style>{`
        .lexical-content {
          font-family: var(--font-hindi), 'Mukta', 'Noto Sans Devanagari', sans-serif;
          color: #1a1a1a;
        }
        .dark .lexical-content {
          color: #e5e5e5;
        }
        
        /* Typography Scale for News - HINDI Optimized */
        .lexical-content h1 { font-size: 1.75rem; line-height: 1.3; margin-top: 2rem; margin-bottom: 1.25rem; }
        @media (min-width: 768px) { .lexical-content h1 { font-size: 2.25rem; } }
        
        .lexical-content h2 { font-size: 1.5rem; line-height: 1.35; margin-top: 2rem; margin-bottom: 1rem; border-left: 4px solid #ef4444; padding-left: 1rem; }
        @media (min-width: 768px) { .lexical-content h2 { font-size: 1.875rem; } }
        
        .lexical-content h3 { font-size: 1.25rem; line-height: 1.4; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        @media (min-width: 768px) { .lexical-content h3 { font-size: 1.5rem; } }
        
        /* Optimal Reading Width & Spacing */
        .lexical-content p {
            margin-bottom: 1.5rem;
            font-size: 1.125rem; /* 18px base size */
            line-height: 1.8;   /* 1.8 line height for Hindi legibility */
            letter-spacing: 0.01em;
        }
        @media (min-width: 768px) {
            .lexical-content p {
                font-size: 1.2rem; /* slightly larger on desktop */
                line-height: 1.9;
            }
        }

        /* Clear floats/margins for images */
        .lexical-content figure { margin: 2rem 0; width: 100%; }
        .lexical-content figcaption { 
            text-align: center; 
            font-size: 0.875rem; 
            color: #6b7280; 
            margin-top: 0.5rem;
            font-family: var(--font-sans);
        }

        /* Links */
        .lexical-content a {
            color: #2563eb;
            text-decoration: underline;
            text-decoration-thickness: 1px;
            text-underline-offset: 3px;
        }
        .lexical-content a:hover {
            color: #1d4ed8;
            text-decoration-thickness: 2px;
        }

        /* Lists */
        .lexical-content ul, .lexical-content ol {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
        }
        .lexical-content li {
            margin-bottom: 0.5rem;
            line-height: 1.7;
            font-size: 1.125rem;
        }
      `}</style>
      <article className="w-full max-w-none">
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className={cn(
            "lexical-content",
            // Utility classes for things not covered in style tag or overrides
            "break-words"
          )}
        />
      </article>
    </>
  )
}

// Memoize to prevent unnecessary re-renders when content hasn't changed
export const ArticleContent = memo(ArticleContentComponent)
