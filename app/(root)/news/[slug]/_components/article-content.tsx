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
          line-height: normal;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .dark .lexical-content {
          color: #e5e5e5;
        }

        /* Responsive Container Spacing */
        .lexical-content > * + * {
            margin-top: 1.5rem;
        }

        /* Twitter Center Alignment & Stability */
        .lexical-content [data-lexical-tweet-id] {
            display: flex;
            justify-content: center;
            margin: 2.5rem 0;
            width: 100%;
            min-height: 200px; /* Prevent layout shift */
        }
        
        /* BBC/Aaj Tak Style Headlines - Bold Khand Font */
        .lexical-content .PlaygroundEditorTheme__h1,
        .lexical-content .PlaygroundEditorTheme__h2,
        .lexical-content .PlaygroundEditorTheme__h3 {
            font-family: var(--font-khand), 'Khand', sans-serif;
            font-weight: 700;
            color: #111;
            letter-spacing: -0.01em;
            margin-bottom: 1rem;
        }
        .dark .lexical-content .PlaygroundEditorTheme__h1,
        .dark .lexical-content .PlaygroundEditorTheme__h2,
        .dark .lexical-content .PlaygroundEditorTheme__h3 {
            color: #fff;
        }

        .lexical-content .PlaygroundEditorTheme__h1 { 
            font-size: 2.25rem; 
            line-height: 1.15; 
            margin-top: 3rem; 
            font-weight: 800; 
        }
        @media (min-width: 768px) { .lexical-content .PlaygroundEditorTheme__h1 { font-size: 3.25rem; } }
        
        .lexical-content .PlaygroundEditorTheme__h2 { 
            font-size: 1.75rem; 
            line-height: 1.25; 
            margin-top: 2.5rem; 
            border-left: 6px solid #ef4444; 
            padding-left: 1.25rem;
            background: linear-gradient(to right, rgba(239, 68, 68, 0.03), transparent);
        }
        @media (min-width: 768px) { .lexical-content .PlaygroundEditorTheme__h2 { font-size: 2.25rem; } }
        
        .lexical-content .PlaygroundEditorTheme__h3 { 
            font-size: 1.5rem; 
            line-height: 1.35; 
            margin-top: 2rem; 
            color: #ef4444; /* Brand accent for sub-headers */
        }
        @media (min-width: 768px) { .lexical-content .PlaygroundEditorTheme__h3 { font-size: 1.85rem; } }
        
        .lexical-content .PlaygroundEditorTheme__paragraph {
            margin-bottom: 1.75rem;
            font-size: 1.15rem;
            line-height: 1.95; /* Optimized for Hindi legibility */
            letter-spacing: 0.015em;
            color: #2d3748;
        }
        .dark .lexical-content .PlaygroundEditorTheme__paragraph {
            color: #cbd5e0;
        }
        @media (min-width: 768px) {
            .lexical-content .PlaygroundEditorTheme__paragraph {
                font-size: 1.35rem;
                line-height: 2.1;
            }
        }

        /* Advanced Code Blocks - Ported from Editor Theme */
        .lexical-content .PlaygroundEditorTheme__code {
            background-color: #f8fafc;
            font-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, Monaco, monospace;
            display: block;
            padding: 1.25rem 1.25rem 1.25rem 3.5rem;
            line-height: 1.7;
            font-size: 0.9375rem;
            margin: 2.5rem 0;
            overflow-x: auto;
            border: 1px solid #e2e8f0;
            position: relative;
            border-radius: 1rem;
            tab-size: 4;
            color: #334155;
            box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
        }
        .dark .lexical-content .PlaygroundEditorTheme__code {
            background-color: #0d1117;
            border-color: #21262d;
            color: #c9d1d9;
        }

        /* Syntax Highlighting Tokens */
        .lexical-content .PlaygroundEditorTheme__tokenComment { color: #8b949e; font-style: italic; }
        .lexical-content .PlaygroundEditorTheme__tokenPunctuation { color: #89ddff; }
        .lexical-content .PlaygroundEditorTheme__tokenProperty { color: #c678dd; }
        .lexical-content .PlaygroundEditorTheme__tokenSelector { color: #98c379; }
        .lexical-content .PlaygroundEditorTheme__tokenOperator { color: #56b6c2; }
        .lexical-content .PlaygroundEditorTheme__tokenAttr { color: #d19a66; }
        .lexical-content .PlaygroundEditorTheme__tokenVariable { color: #e06c75; }
        .lexical-content .PlaygroundEditorTheme__tokenFunction { color: #61afef; }

        /* Professional Tables - News Grade */
        .lexical-content .PlaygroundEditorTheme__table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
            margin: 2.5rem 0;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .dark .lexical-content .PlaygroundEditorTheme__table {
            border-color: #30363d;
            background-color: #161b22;
        }
        .lexical-content .PlaygroundEditorTheme__tableCell {
            border-bottom: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            padding: 1rem 1.25rem;
            text-align: left;
            font-size: 1.1rem;
        }
        .lexical-content .PlaygroundEditorTheme__tableCell:last-child {
            border-right: 0;
        }
        .lexical-content .PlaygroundEditorTheme__tableRow:last-child .PlaygroundEditorTheme__tableCell {
            border-bottom: 0;
        }
        .dark .lexical-content .PlaygroundEditorTheme__tableCell {
            border-color: #30363d;
        }
        .lexical-content .PlaygroundEditorTheme__tableCellHeader {
            background-color: #f8fafc;
            font-weight: 700;
            color: #1e293b;
            text-transform: uppercase;
            font-size: 0.9rem;
            letter-spacing: 0.05em;
        }
        .dark .lexical-content .PlaygroundEditorTheme__tableCellHeader {
            background-color: #21262d;
            color: #f0f6fc;
        }

        /* Collapsible Sections */
        .lexical-content .Collapsible__container {
            background-color: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 1rem;
            margin-bottom: 2rem;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .dark .lexical-content .Collapsible__container {
            background-color: #0d1117;
            border-color: #30363d;
        }
        .lexical-content .Collapsible__title {
            padding: 1.25rem 1.5rem;
            font-weight: 700;
            cursor: pointer;
            outline: none;
            list-style-position: inside;
            background-color: #f8fafc;
            user-select: none;
            transition: background 0.2s;
        }
        .lexical-content .Collapsible__title:hover {
            background-color: #f1f5f9;
        }
        .dark .lexical-content .Collapsible__title {
            background-color: #161b22;
        }
        .dark .lexical-content .Collapsible__title:hover {
            background-color: #21262d;
        }
        .lexical-content .Collapsible__container[open] .Collapsible__title {
            border-bottom: 1px solid #e2e8f0;
        }
        .dark .lexical-content .Collapsible__container[open] .Collapsible__title {
            border-bottom-color: #30363d;
        }
        .lexical-content .Collapsible__content {
            padding: 1.5rem;
            line-height: 1.8;
        }

        /* Blockquotes - High Impact News Style */
        .lexical-content .PlaygroundEditorTheme__quote {
            margin: 3.5rem 0;
            padding: 2rem 2.5rem 2rem 3.5rem;
            border-left: 6px solid #ef4444;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.02) 0%, #fff 100%);
            font-style: italic;
            font-size: 1.5rem;
            line-height: 1.8;
            color: #1a202c;
            position: relative;
            border-radius: 0 0.75rem 0.75rem 0;
            box-shadow: 4px 4px 20px rgba(0,0,0,0.02);
        }
        .dark .lexical-content .PlaygroundEditorTheme__quote {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, #0d1117 100%);
            color: #f0f6fc;
        }
        .lexical-content .PlaygroundEditorTheme__quote::before {
            content: '“';
            position: absolute;
            top: -0.5rem;
            left: 0.75rem;
            font-size: 6rem;
            color: rgba(239, 68, 68, 0.12);
            font-family: Georgia, serif;
            line-height: 1;
            user-select: none;
        }

        .lexical-content .PlaygroundEditorTheme__hr {
            margin: 4rem 0;
            border: 0;
            height: 1px;
            background: linear-gradient(to right, transparent, #ef4444, transparent);
            opacity: 0.15;
        }

        .lexical-content .PlaygroundEditorTheme__link {
            color: #ef4444;
            text-decoration: none;
            font-weight: 700;
            border-bottom: 2px solid rgba(239, 68, 68, 0.15);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .lexical-content .PlaygroundEditorTheme__link:hover {
            border-bottom-color: #ef4444;
            background-color: rgba(239, 68, 68, 0.04);
            color: #dc2626;
        }

        /* Lists & Checklists - Refined BBC Style */
        .lexical-content .PlaygroundEditorTheme__ul, 
        .lexical-content .PlaygroundEditorTheme__ol {
            margin: 2rem 0;
            padding-left: 2.5rem;
        }
        .lexical-content .PlaygroundEditorTheme__ol {
            list-style-type: decimal !important;
        }
        .lexical-content .PlaygroundEditorTheme__ul {
            list-style-type: disc !important;
        }

        .lexical-content .PlaygroundEditorTheme__listitem {
            margin-bottom: 1rem;
            line-height: 1.8;
            font-size: 1.25rem;
            padding-left: 0.5rem;
        }
        .lexical-content .PlaygroundEditorTheme__listitem:last-child {
            margin-bottom: 0;
        }

        /* Checklists - Precise Alignment */
        .lexical-content .PlaygroundEditorTheme__checklist {
            list-style: none !important;
            padding-left: 0.5rem;
            margin: 2rem 0;
        }
        .lexical-content .PlaygroundEditorTheme__listitemChecked,
        .lexical-content .PlaygroundEditorTheme__listitemUnchecked {
            position: relative;
            padding-left: 3rem;
            list-style-type: none !important;
            margin-bottom: 1.25rem;
            line-height: 1.8;
            font-size: 1.25rem;
            min-height: 1.75rem;
            display: flex;
            align-items: flex-start;
        }
        .lexical-content .PlaygroundEditorTheme__listitemChecked {
            text-decoration: line-through;
            color: #94a3b8;
            opacity: 0.8;
        }
        .lexical-content .PlaygroundEditorTheme__listitemChecked::before,
        .lexical-content .PlaygroundEditorTheme__listitemUnchecked::before {
            content: "";
            width: 1.5rem;
            height: 1.5rem;
            top: 0.3rem;
            left: 0;
            display: block;
            position: absolute;
            border: 2.5px solid #ef4444;
            border-radius: 0.5rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .lexical-content .PlaygroundEditorTheme__listitemChecked::before {
            background-color: #ef4444;
            border-color: #ef4444;
            transform: scale(1);
        }
        .lexical-content .PlaygroundEditorTheme__listitemChecked::after {
            content: "";
            border-color: white;
            border-style: solid;
            position: absolute;
            display: block;
            top: 0.55rem;
            width: 0.45rem;
            left: 0.55rem;
            height: 0.8rem;
            transform: rotate(45deg);
            border-width: 0 3px 3px 0;
        }

        .lexical-content .PlaygroundEditorTheme__textBold { font-weight: 700; color: #000; }
        .dark .lexical-content .PlaygroundEditorTheme__textBold { color: #fff; }
        
        .lexical-content .PlaygroundEditorTheme__textItalic { 
            font-style: italic; 
            font-family: inherit;
        }
        
        .lexical-content .PlaygroundEditorTheme__hashtag {
            color: #fff;
            font-weight: 700;
            background-color: #ef4444;
            padding: 0.2rem 0.6rem;
            border-radius: 9999px;
            font-size: 0.85em;
            text-transform: uppercase;
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.25);
        }

        /* Hero Image Enhancement */
        .lexical-content .PlaygroundEditorTheme__image {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 4rem auto;
            border-radius: 1.25rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: transform 0.3s ease;
        }
        .lexical-content .PlaygroundEditorTheme__image:hover {
            transform: scale(1.01);
        }

        /* Multi-Column Layout System - Robust & Stable */
        .lexical-content .PlaygroundEditorTheme__layoutContainer {
            display: grid;
            gap: 2rem;
            margin: 2.5rem 0;
            width: 100%;
            align-items: start;
        }
        @media (max-width: 1024px) {
            .lexical-content .PlaygroundEditorTheme__layoutContainer {
                gap: 1.5rem;
            }
        }
        /* Tablet & Mobile Breakpoint - Force stacking at 768px for stability */
        @media (max-width: 820px) {
            .lexical-content .PlaygroundEditorTheme__layoutContainer {
                grid-template-columns: 1fr !important;
                gap: 2rem;
            }
        }
        .lexical-content .PlaygroundEditorTheme__layoutItem {
            min-width: 100%; /* Force full width within the grid cell */
            display: flex;
            flex-direction: column;
            overflow: hidden; /* Contain children */
            height: 100%;
        }
        @media (min-width: 821px) {
            .lexical-content .PlaygroundEditorTheme__layoutItem {
                min-width: 0;
            }
        }

        /* Responsive Tables with Scrolling Wrapper */
        .lexical-content .PlaygroundEditorTheme__tableWrapper {
            width: 100%;
            overflow-x: auto;
            margin: 2.5rem 0;
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            scrollbar-width: thin;
        }
        .dark .lexical-content .PlaygroundEditorTheme__tableWrapper {
            background-color: #161b22;
            border-color: #30363d;
        }
        .lexical-content .PlaygroundEditorTheme__table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
            margin: 0 !important; /* Managed by wrapper */
            border: 0 !important; /* Managed by wrapper */
        }

        /* Image Scalability within Columns */
        .lexical-content .PlaygroundEditorTheme__layoutItem .PlaygroundEditorTheme__image {
            width: 100%;
            height: auto;
            margin: 1.5rem 0;
            object-fit: cover;
        }

        /* Support for specialized node types from Lexical */
        .lexical-content .PlaygroundEditorTheme__textCode {
            background: rgba(239, 68, 68, 0.05);
            color: #ef4444;
            padding: 0.2rem 0.4rem;
            border-radius: 0.375rem;
            font-family: monospace;
            font-size: 0.9em;
        }
        .dark .lexical-content .PlaygroundEditorTheme__textCode {
            background: rgba(239, 68, 68, 0.1);
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
