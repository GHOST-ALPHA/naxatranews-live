"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import React, { memo } from "react";

interface SectionHeaderProps {
  title: string;
  href?: string;
  className?: string;
  isLive?: boolean;
}

const SectionHeader = memo(({ title, href, className, isLive = false }: SectionHeaderProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border/50 pb-3 mb-6 group/header",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Modern Accent Pill */}
        <div className="h-7 w-1.5 rounded-full bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.4)]" />

        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight khand-font text-foreground/90 transition-colors duration-300 group-hover/header:text-red-600">
            {title}
          </h2>

          {isLive && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 border border-red-200 dark:border-red-900/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider leading-none">
                Live
              </span>
            </div>
          )}
        </div>
      </div>

      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-all duration-300 hover:text-red-600 group-hover/header:translate-x-0"
          aria-label={`View more ${title}`}
        >
          <span>और देखें</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
});

SectionHeader.displayName = "SectionHeader";

export default SectionHeader;