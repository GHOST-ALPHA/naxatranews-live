/**
 * Convert Lexical JSON state to SEO-friendly HTML
 * This utility converts Lexical editor state to HTML for public display
 * Optimized for fast image loading while preserving format and style
 * Uses local media storage system
 */

import type { SerializedEditorState } from "lexical";

/**
 * Check if URL is a local storage URL
 */
function isLocalStorageUrl(url: string): boolean {
  return url.startsWith("/storage/") || url.startsWith("./storage/");
}

/**
 * Normalize local storage URL to ensure it starts with /
 */
function normalizeLocalStorageUrl(url: string): string {
  if (url.startsWith("./storage/")) {
    return url.replace("./storage/", "/storage/");
  }
  if (!url.startsWith("/") && url.startsWith("storage/")) {
    return `/${url}`;
  }
  return url;
}

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  style?: string;
  [key: string]: any;
}

/**
 * Convert Lexical JSON to HTML string
 */
export function lexicalToHTML(lexicalState: SerializedEditorState | string): string {
  try {
    // Parse if string
    const state = typeof lexicalState === "string" ? JSON.parse(lexicalState) : lexicalState;

    if (!state || !state.root || !state.root.children) {
      return "";
    }

    const htmlParts: string[] = [];

    // Process each child node
    state.root.children.forEach((node: LexicalNode) => {
      htmlParts.push(processNode(node));
    });

    return htmlParts.join("");
  } catch (error) {
    // If parsing fails, it might be legacy HTML or plain text
    // Return untampered string if it's not JSON
    if (typeof lexicalState === "string") {
      return lexicalState;
    }
    console.error("Error converting Lexical to HTML:", error);
    return "";
  }
}

/**
 * Convert Lexical JSON to plain text string
 * Useful for excerpts, SEO descriptions, and meta tags
 */
export function lexicalToText(lexicalState: SerializedEditorState | string): string {
  try {
    const state = typeof lexicalState === "string" ? JSON.parse(lexicalState) : lexicalState;
    if (!state || !state.root || !state.root.children) return "";

    return processNodeToText(state.root);
  } catch (error) {
    // Fallback for legacy content
    if (typeof lexicalState === "string") {
      // Remove HTML tags if it's legacy HTML
      return lexicalState.replace(/<[^>]*>?/gm, '');
    }
    console.error("Error converting Lexical to text:", error);
    return "";
  }
}

/**
 * Process node for plain text extraction
 */
function processNodeToText(node: LexicalNode): string {
  if (!node) return "";

  if (node.type === "text") {
    return node.text || "";
  }

  if (node.type === "linebreak") {
    return "\n";
  }

  if (node.children) {
    const text = node.children.map(processNodeToText).join("");
    // Add spacing for block-level elements
    if (["paragraph", "heading", "list", "quote", "listitem"].includes(node.type)) {
      return text + "\n";
    }
    return text;
  }

  return "";
}

const THEME_PREFIX = "PlaygroundEditorTheme";

/**
 * Process a single Lexical node and convert to HTML
 */
function processNode(node: LexicalNode): string {
  if (!node) return "";

  const { type, children, text, format, style, ...attributes } = node;

  // Extract alignment from node format
  const textAlign = (node as any).format === 1 ? "center" : (node as any).format === 2 ? "right" : (node as any).format === 3 ? "justify" : "";
  const baseStyle = textAlign ? `text-align: ${textAlign};` : "";
  const combinedStyle = [baseStyle, style].filter(Boolean).join(" ");
  const styleAttr = combinedStyle ? `style="${escapeHtml(combinedStyle)}"` : "";

  switch (type) {
    case "text":
      return formatText(text || "", format || 0, style);

    case "paragraph":
      const pContent = (children && children.length > 0) ? children.map(processNode).join("") : "<br />";
      return `<p class="${THEME_PREFIX}__paragraph" ${styleAttr}>${pContent}</p>`;

    case "heading":
      const tag = attributes.tag || "h1";
      const hContent = children ? children.map(processNode).join("") : "";
      return `<${tag} class="${THEME_PREFIX}__${tag}" ${styleAttr}>${hContent}</${tag}>`;

    case "quote":
      const quoteContent = children ? children.map(processNode).join("") : "";
      return `<blockquote class="${THEME_PREFIX}__quote" ${styleAttr}>${quoteContent}</blockquote>`;

    case "list":
      const isChecklist = attributes.listType === "check";
      const listTag = attributes.listType === "number" ? "ol" : "ul";
      const listClass = isChecklist ? "checklist" : (attributes.listType === "number" ? "ol" : "ul");
      const listContent = children ? children.map(processNode).join("") : "";
      return `<${listTag} class="${THEME_PREFIX}__${listClass}" ${styleAttr}>${listContent}</${listTag}>`;

    case "listitem":
      const itemContent = children ? children.map(processNode).join("") : "";
      const isChecked = attributes.checked === true;
      const itemClass = isChecked ? "listitemChecked" : "listitem";
      const uncheckedClass = !isChecked && attributes.listType === "check" ? "listitemUnchecked" : "";
      const finalItemClass = uncheckedClass || itemClass;
      return `<li value="${attributes.value || 1}" class="${THEME_PREFIX}__${finalItemClass}" ${styleAttr}>${itemContent}</li>`;

    case "link":
      const linkContent = children ? children.map(processNode).join("") : "";
      const url = attributes.url || "#";
      const linkTarget = attributes.target || "_self";
      return `<a href="${escapeHtml(url)}" target="${linkTarget}" class="${THEME_PREFIX}__link" ${styleAttr}>${linkContent}</a>`;

    case "hashtag":
      return `<span class="${THEME_PREFIX}__hashtag" style="white-space: pre-wrap;">${escapeHtml(text || "")}</span>`;

    case "image":
      const src = attributes.src || "";
      const alt = attributes.altText || "";
      const imgWidth = attributes.width;
      const imgHeight = attributes.height;
      const maxWidth = attributes.maxWidth || 800;

      const normalizedSrc = isLocalStorageUrl(src) ? normalizeLocalStorageUrl(src) : src;

      const imgAttributes: string[] = [];
      imgAttributes.push(`src="${escapeHtml(normalizedSrc)}"`);
      imgAttributes.push(`alt="${escapeHtml(alt)}"`);

      if (typeof imgWidth === "number" && typeof imgHeight === "number" && imgWidth > 0 && imgHeight > 0) {
        imgAttributes.push(`width="${imgWidth}"`);
        imgAttributes.push(`height="${imgHeight}"`);
      }

      imgAttributes.push(`loading="lazy"`);
      imgAttributes.push(`decoding="async"`);

      const styleParts: string[] = [];
      styleParts.push(`max-width: 100%`);
      styleParts.push(`height: auto`);
      styleParts.push(`display: block`);
      styleParts.push(`margin: 0 auto`);

      if (maxWidth && maxWidth >= 300) {
        styleParts.push(`max-width: min(100%, ${maxWidth}px)`);
      }

      imgAttributes.push(`style="${escapeHtml(styleParts.join("; "))}"`);
      imgAttributes.push(`class="${THEME_PREFIX}__image"`);

      return `<img ${imgAttributes.join(" ")} />`;

    case "linebreak":
      return "<br />";

    case "code":
      const codeContent = children ? children.map(processNode).join("") : text || "";
      // Block-level code node should be wrapped in pre
      return `<pre class="${THEME_PREFIX}__code" spellcheck="false"><code>${codeContent}</code></pre>`;

    case "codehighlight":
      const codeHighlightContent = children ? children.map(processNode).join("") : text || "";
      const highlightType = attributes.highlightType || "";
      // Use the specific token class from the theme
      const tokenClass = highlightType ? `${THEME_PREFIX}__token${highlightType.charAt(0).toUpperCase() + highlightType.slice(1)}` : "";
      return `<span class="${tokenClass}">${escapeHtml(codeHighlightContent)}</span>`;

    case "horizontalrule":
      return `<hr class="${THEME_PREFIX}__hr" />`;

    case "table":
      const tableContent = children ? children.map(processNode).join("") : "";
      return `<div class="${THEME_PREFIX}__tableWrapper"><table class="${THEME_PREFIX}__table">${tableContent}</table></div>`;

    case "tablerow":
      const rowContent = children ? children.map(processNode).join("") : "";
      return `<tr class="${THEME_PREFIX}__tableRow">${rowContent}</tr>`;

    case "tablecell":
      const isHeader = attributes.headerState === 1 || attributes.headerState === 3;
      const cellTag = isHeader ? "th" : "td";
      const cellClass = isHeader ? "tableCellHeader" : "tableCell";
      const cellContent = children ? children.map(processNode).join("") : "";
      const colSpan = attributes.colSpan ? ` colspan="${attributes.colSpan}"` : "";
      const rowSpan = attributes.rowSpan ? ` rowspan="${attributes.rowSpan}"` : "";
      return `<${cellTag} class="${THEME_PREFIX}__${cellClass}"${colSpan}${rowSpan}>${cellContent}</${cellTag}>`;


    case "youtube":
      const videoID = attributes.videoID || attributes.id || "";
      if (!videoID) return "";
      return `<div class="${THEME_PREFIX}__youtubeContainer" style="max-width: 800px; margin: 2.5rem auto; width: 100%;">
        <div class="${THEME_PREFIX}__youtube" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <iframe 
            src="https://www.youtube-nocookie.com/embed/${escapeHtml(videoID)}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            title="YouTube video player"
            loading="lazy"
          ></iframe>
        </div>
      </div>`;

    case "tweet":
      const tweetID = attributes.id || attributes.tweetID || "";
      if (!tweetID) return "";
      const tweetUrl = `https://x.com/i/web/status/${tweetID}`;
      return `<div data-lexical-tweet-id="${escapeHtml(tweetID)}">${tweetUrl}</div>`;

    case "collapsible-container":
      const open = attributes.open ? "open" : "";
      const containerContent = children ? children.map(processNode).join("") : "";
      return `<details class="Collapsible__container" ${open}>${containerContent}</details>`;

    case "collapsible-title":
      const titleContent = children ? children.map(processNode).join("") : "";
      return `<summary class="Collapsible__title">${titleContent}</summary>`;

    case "collapsible-content":
      const collContent = children ? children.map(processNode).join("") : "";
      return `<div class="Collapsible__content">${collContent}</div>`;

    case "layout-container":
      const layoutContainerChildren = children ? children.map(processNode).join("") : "";
      const templateColumns = attributes.templateColumns || attributes.containerTemplate || "";
      const layoutStyle = templateColumns ? `style="grid-template-columns: ${templateColumns};"` : "";
      return `<div class="${THEME_PREFIX}__layoutContainer" ${layoutStyle}>${layoutContainerChildren}</div>`;

    case "layout-item":
      const layoutItemContent = children ? children.map(processNode).join("") : "";
      return `<div class="${THEME_PREFIX}__layoutItem">${layoutItemContent}</div>`;

    default:
      if (children) {
        return children.map(processNode).join("");
      }
      return text ? `<span style="white-space: pre-wrap;">${escapeHtml(text)}</span>` : "";
  }
}

/**
 * Format text with formatting flags and wrap in span
 */
function formatText(text: string, format: number, style?: string): string {
  if (!text) return "";

  let content = escapeHtml(text);
  const classes: string[] = [];

  // Apply formatting flags and collect classes
  if (format & 1) {
    content = `<strong class="${THEME_PREFIX}__textBold">${content}</strong>`;
  }
  if (format & 2) {
    content = `<em class="${THEME_PREFIX}__textItalic">${content}</em>`;
  }
  if (format & 4) {
    content = `<span class="${THEME_PREFIX}__textStrikethrough" style="text-decoration: line-through;">${content}</span>`;
  }
  if (format & 8) {
    content = `<span class="${THEME_PREFIX}__textUnderline" style="text-decoration: underline;">${content}</span>`;
  }
  if (format & 16) {
    content = `<code class="${THEME_PREFIX}__textCode">${content}</code>`;
  }
  if (format & 32) {
    content = `<sub class="${THEME_PREFIX}__textSubscript">${content}</sub>`;
  }
  if (format & 64) {
    content = `<sup class="${THEME_PREFIX}__textSuperscript">${content}</sup>`;
  }

  // Final wrap in span with white-space preservation
  const inlineStyle = style ? `style="${escapeHtml(style)}; white-space: pre-wrap;"` : 'style="white-space: pre-wrap;"';

  return `<span ${inlineStyle}>${content}</span>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  if (typeof text !== "string") return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

