"use client"

import { cn } from "@/lib/utils"
import { useEffect, useCallback, memo } from "react"

// Type declaration for Twitter widget
declare global {
  interface Window {
    twttr?: {
      ready?: (callback: () => void) => void
      widgets: {
        load: (element?: HTMLElement | null) => void
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
    const images = contentDiv.querySelectorAll(`img.PlaygroundEditorTheme__image, img`)
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

    // Load Twitter/X embeds (optimized for reference structure)
    const tweetDivs = contentDiv.querySelectorAll('[data-lexical-tweet-id]')
    if (tweetDivs.length > 0) {
      const executeLoad = () => {
        if (window.twttr?.widgets) {
          tweetDivs.forEach((div) => {
            const tweetId = div.getAttribute('data-lexical-tweet-id')
            if (tweetId && !div.hasAttribute('data-twitter-initialized')) {
              try {
                // Clear the URL text content before creating the widget
                div.innerHTML = '';
                window.twttr!.widgets.createTweet(tweetId, div as HTMLElement);
                div.setAttribute('data-twitter-initialized', 'true');
              } catch (e) {
                console.error('Twitter widget create error:', e);
              }
            }
          })
        }
      }

      // 1. Check if Twitter object exists and is ready
      if (window.twttr?.widgets) {
        executeLoad()
      } else {
        // 2. Scan for existing script or create new one
        let script = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]') as HTMLScriptElement

        if (!script) {
          script = document.createElement('script')
          script.src = 'https://platform.twitter.com/widgets.js'
          script.async = true
          script.charset = 'utf-8'
          document.body.appendChild(script)
        }

        // 3. Robust event handling
        const onScriptReady = () => {
          if (window.twttr?.ready) {
            window.twttr.ready(() => executeLoad());
          } else {
            // Fallback for immediate execution or polling
            setTimeout(executeLoad, 500);
          }
        }

        // Use readyState fallback
        if ((script as any).readyState === 'complete' || (script as any).readyState === 'loaded') {
          onScriptReady()
        } else {
          script.addEventListener('load', onScriptReady)
        }
      }
    }
  }, [content, handleImageError])

  return (
    <>
      <style>{`
        .lexical-content {
          font-family: var(--font-hindi), 'Mukta', 'Noto Sans Devanagari', ui-sans-serif, system-ui, -apple-system, sans-serif;
          color: #1a1a1a;
          line-height: 1.7; /* Match editor leading-7 */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .dark .lexical-content {
          color: #e5e5e5;
        }

        /* Responsive Container Spacing */
        .lexical-content > * + * {
            margin-top: 1rem;
        }

        /* Twitter Center Alignment & Stability */
        .lexical-content [data-lexical-tweet-id] {
            display: flex;
            justify-content: center;
            margin: 2rem 0;
            width: 100%;
            min-height: 200px;
        }
        
        /* BBC/Aaj Tak Style Headlines - Bold Khand Font */
        .lexical-content .PlaygroundEditorTheme__h1,
        .lexical-content .PlaygroundEditorTheme__h2,
        .lexical-content .PlaygroundEditorTheme__h3 {
            font-family: var(--font-khand), 'Khand', sans-serif;
            font-weight: 700;
            color: #111;
            letter-spacing: -0.01em;
            margin-bottom: 0.75rem;
        }
        .dark .lexical-content .PlaygroundEditorTheme__h1,
        .dark .lexical-content .PlaygroundEditorTheme__h2,
        .dark .lexical-content .PlaygroundEditorTheme__h3 {
            color: #fff;
        }

        .lexical-content .PlaygroundEditorTheme__h1 { 
            font-size: 1.85rem; 
            line-height: 1.2; 
            margin-top: 2rem; 
            font-weight: 800; 
        }
        @media (min-width: 768px) { .lexical-content .PlaygroundEditorTheme__h1 { font-size: 2.75rem; } }
        
        .lexical-content .PlaygroundEditorTheme__h2 { 
            font-size: 1.5rem; 
            line-height: 1.3; 
            margin-top: 1.75rem; 
            border-left: 5px solid #ef4444; 
            padding-left: 1rem;
            background: linear-gradient(to right, rgba(239, 68, 68, 0.02), transparent);
        }
        @media (min-width: 768px) { .lexical-content .PlaygroundEditorTheme__h2 { font-size: 2rem; } }
        
        .lexical-content .PlaygroundEditorTheme__h3 { 
            font-size: 1.25rem; 
            line-height: 1.4; 
            margin-top: 1.5rem; 
            color: #ef4444;
        }
        @media (min-width: 768px) { .lexical-content .PlaygroundEditorTheme__h3 { font-size: 1.5rem; } }
        
        .lexical-content .PlaygroundEditorTheme__paragraph {
            margin-bottom: 1rem;
            font-size: 1.125rem;
            line-height: 1.7; /* Precise match for Hindi digital news */
            letter-spacing: 0.01em;
            color: #2d3748;
        }
        .dark .lexical-content .PlaygroundEditorTheme__paragraph {
            color: #cbd5e0;
        }
        @media (min-width: 768px) {
            .lexical-content .PlaygroundEditorTheme__paragraph {
                font-size: 1.25rem;
                line-height: 1.75;
            }
        }

        /* Advanced Code Blocks */
        .lexical-content .PlaygroundEditorTheme__code {
            background-color: #f8fafc;
            font-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, Monaco, monospace;
            display: block;
            padding: 1rem 1rem 1rem 3rem;
            line-height: 1.6;
            font-size: 0.875rem;
            margin: 2rem 0;
            overflow-x: auto;
            border: 1px solid #e2e8f0;
            position: relative;
            border-radius: 0.75rem;
            color: #334155;
        }
        .dark .lexical-content .PlaygroundEditorTheme__code {
            background-color: #0d1117;
            border-color: #21262d;
            color: #c9d1d9;
        }

        /* Tables */
        .lexical-content .PlaygroundEditorTheme__table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
            margin: 2rem 0;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            overflow: hidden;
        }
        .dark .lexical-content .PlaygroundEditorTheme__table {
            border-color: #30363d;
            background-color: #161b22;
        }
        .lexical-content .PlaygroundEditorTheme__tableCell {
            border-bottom: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            padding: 0.75rem 1rem;
            text-align: left;
            font-size: 1rem;
        }
        .dark .lexical-content .PlaygroundEditorTheme__tableCell {
            border-color: #30363d;
        }

        /* Blockquotes - High Impact News Style */
        .lexical-content .PlaygroundEditorTheme__quote {
            margin: 2.5rem 0;
            padding: 1.5rem 2rem 1.5rem 2.5rem;
            border-left: 5px solid #ef4444;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.01) 0%, #fff 100%);
            font-style: italic;
            font-size: 1.25rem;
            line-height: 1.6;
            color: #1a202c;
            position: relative;
            border-radius: 0 0.5rem 0.5rem 0;
            box-shadow: 2px 2px 10px rgba(0,0,0,0.01);
        }
        .dark .lexical-content .PlaygroundEditorTheme__quote {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.03) 0%, #0d1117 100%);
            color: #f0f6fc;
        }
        .lexical-content .PlaygroundEditorTheme__quote::before {
            content: '“';
            position: absolute;
            top: -0.25rem;
            left: 0.5rem;
            font-size: 4rem;
            color: rgba(239, 68, 68, 0.1);
            font-family: Georgia, serif;
            line-height: 1;
        }

        .lexical-content .PlaygroundEditorTheme__hr {
            margin: 3rem 0;
            border: 0;
            height: 1px;
            background: linear-gradient(to right, transparent, #ef4444, transparent);
            opacity: 0.1;
        }

        .lexical-content .PlaygroundEditorTheme__link {
            color: #ef4444;
            text-decoration: none;
            font-weight: 600;
            border-bottom: 1px solid rgba(239, 68, 68, 0.2);
            transition: all 0.2s ease;
        }
        .lexical-content .PlaygroundEditorTheme__link:hover {
            border-bottom-color: #ef4444;
            background-color: rgba(239, 68, 68, 0.04);
        }

        /* Lists */
        .lexical-content .PlaygroundEditorTheme__ul, 
        .lexical-content .PlaygroundEditorTheme__ol {
            margin: 1.5rem 0;
            padding-left: 2rem;
        }
        .lexical-content .PlaygroundEditorTheme__listitem {
            margin-bottom: 0.75rem;
            line-height: 1.7;
            font-size: 1.125rem;
        }
        @media (min-width: 768px) {
            .lexical-content .PlaygroundEditorTheme__listitem {
                font-size: 1.25rem;
            }
        }

        .lexical-content .PlaygroundEditorTheme__textBold { font-weight: 700; color: #000; }
        .dark .lexical-content .PlaygroundEditorTheme__textBold { color: #fff; }
        
        /* Hero Image Enhancement */
        .lexical-content .PlaygroundEditorTheme__image {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 2.5rem auto;
            border-radius: 0.75rem;
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(0, 0, 0, 0.05);
        }

        /* Layout System */
        .lexical-content .PlaygroundEditorTheme__layoutContainer {
            display: grid;
            gap: 1.5rem;
            margin: 2rem 0;
            width: 100%;
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

export const ArticleContent = memo(ArticleContentComponent)
