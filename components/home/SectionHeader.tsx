"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import React, { memo } from "react";

interface SectionHeaderProps {
  /** The text to display as the title */
  title: string;
  /** Optional link for the "See More" button */
  href?: string;
  /** Optional CSS class for the wrapper */
  className?: string;
  /** Whether to show a pulsing 'Live' indicator */
  isLive?: boolean;
}

/**
 * SectionHeader component for categorized news sections.
 * Optimized with React.memo for high-performance rendering on the home page.
 */
export const SectionHeader = memo(({
  title,
  href,
  className,
  isLive = false
}: SectionHeaderProps) => {
  const content = (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border pb-3 mb-8 group/header",
        className
      )}
      aria-label={`${title} section header`}
    >
      <div className="flex items-center gap-4 relative">
        {/* Animated Brand Stripe with Glimmer Effect */}
        <div className="relative h-7 w-1.5 overflow-hidden rounded-full bg-muted shadow-sm">
          {/* Base Brand Color */}
          <div className="absolute inset-0 bg-red-600" />

          {/* Vertical Glimmer Effect */}
          <div className="absolute inset-0 w-full animate-shimmer bg-gradient-to-b from-transparent via-white/40 to-transparent -translate-y-full group-hover/header:translate-y-full transition-transform duration-1000" />

          {/* Inner Glow */}
          <div className="absolute inset-x-0 top-0 h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
        </div>

        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight khand-font text-foreground transition-all duration-300 group-hover/header:text-red-600 leading-[1.6] py-[2px]">
            {title}
          </h2>

          {/* Live Indicator Tag */}
          {isLive && (
            <div className="flex items-center gap-1.5 rounded-sm bg-red-600/10 px-2 py-0.5 border border-red-600/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest leading-none">Live</span>
            </div>
          )}
        </div>

        {/* Dynamic Underline Interaction */}
        <div className="absolute -bottom-[13px] left-0 h-[2.5px] w-0 bg-red-600 transition-all duration-500 group-hover/header:w-full opacity-80" />
      </div>

      {href ? (
        <div
          className="flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-all duration-300 hover:bg-red-600 hover:text-white hover:border-red-600 group-hover/header:translate-x-1 shadow-sm hover:shadow-md cursor-pointer"
          role="link"
          aria-label={`View more ${title}`}
        >
          <span>See More</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/header:translate-x-0.5" />
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} prefetch={false} className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-sm mb-2">
        {content}
      </Link>
    );
  }

  return content;
});

SectionHeader.displayName = "SectionHeader";

export default SectionHeader;