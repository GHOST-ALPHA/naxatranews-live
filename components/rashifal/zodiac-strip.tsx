"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { RASHIFAL_DATA } from "@/lib/data/rashifal-data"
import { useRef, useEffect } from "react"

interface ZodiacStripProps {
    activeSlug?: string
}

export function ZodiacStrip({ activeSlug }: ZodiacStripProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (activeSlug && scrollRef.current) {
            const activeElement = scrollRef.current.querySelector(`#zodiac-${activeSlug}`)
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }
        }
    }, [activeSlug])

    return (
        <div className="w-full py-6 mb-4">
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar items-center md:justify-center"
            >
                {RASHIFAL_DATA.map((sign) => {
                    const isActive = activeSlug === sign.slug
                    return (
                        <Link
                            key={sign.slug}
                            id={`zodiac-${sign.slug}`}
                            href={`/astrology/${sign.slug}`}
                            className={cn(
                                "flex flex-col items-center gap-2 min-w-[64px] transition-all duration-300 group cursor-pointer",
                                isActive ? "scale-110" : "opacity-70 hover:opacity-100 hover:scale-105"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-3xl shadow-sm border transition-all duration-300 bg-white dark:bg-slate-800",
                                    isActive
                                        ? "border-red-500 shadow-md ring-2 ring-red-100 dark:ring-red-900/30"
                                        : "border-slate-100 dark:border-slate-700 group-hover:border-red-200"
                                )}
                            >
                                <span className={cn(
                                    "text-2xl md:text-3xl filter drop-shadow-sm",
                                    isActive ? "scale-110" : "grayscale-[0.3] group-hover:grayscale-0"
                                )}>
                                    {sign.icon}
                                </span>
                            </div>

                            <span className={cn(
                                "text-xs font-bold transition-colors",
                                isActive ? "text-red-600" : "text-slate-600 dark:text-slate-400 group-hover:text-red-500"
                            )}>
                                {sign.name}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
