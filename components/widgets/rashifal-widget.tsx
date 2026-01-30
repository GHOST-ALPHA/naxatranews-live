"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

const ZODIAC_SIGNS = [
    { name: "मेष", slug: "mesh", icon: "♈", color: "text-red-500", label: "Aries" },
    { name: "वृष", slug: "vrish", icon: "♉", color: "text-green-500", label: "Taurus" },
    { name: "मिथुन", slug: "mithun", icon: "♊", color: "text-yellow-500", label: "Gemini" },
    { name: "कर्क", slug: "kark", icon: "♋", color: "text-blue-500", label: "Cancer" },
    { name: "सिंह", slug: "singh", icon: "♌", color: "text-orange-500", label: "Leo" },
    { name: "कन्या", slug: "kanya", icon: "♍", color: "text-emerald-500", label: "Virgo" },
    { name: "तुला", slug: "tula", icon: "♎", color: "text-indigo-500", label: "Libra" },
    { name: "वृश्चिक", slug: "vrishchik", icon: "♏", color: "text-rose-500", label: "Scorpio" },
    { name: "धनु", slug: "dhanu", icon: "♐", color: "text-amber-500", label: "Sagittarius" },
    { name: "मकर", slug: "makar", icon: "♑", color: "text-cyan-600", label: "Capricorn" },
    { name: "कुंभ", slug: "kumbh", icon: "♒", color: "text-sky-500", label: "Aquarius" },
    { name: "मीन", slug: "meen", icon: "♓", color: "text-violet-500", label: "Pisces" },
]

export function RashifalWidget() {
    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-md border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                    <h3 className="font-bold text-sm tracking-wide">आज का राशिफल</h3>
                </div>
                <span className="text-[10px] text-white/80 font-medium bg-white/10 px-2 py-0.5 rounded cursor-default">
                    Daily
                </span>
            </div>

            {/* Grid */}
            <div className="p-4 grid grid-cols-4 gap-3">
                {ZODIAC_SIGNS.map((sign) => (
                    <Link
                        key={sign.slug}
                        href={`/astrology/${sign.slug}`}
                        className="group flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-300"
                        title={sign.label}
                    >
                        <div className={`
              w-10 h-10 flex items-center justify-center rounded-full 
              bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700
              group-hover:border-red-200 group-hover:scale-110 group-hover:shadow-md
              transition-all duration-300
            `}>
                            <span className={`text-xl leading-none ${sign.color}`}>{sign.icon}</span>
                        </div>

                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-red-600 transition-colors">
                            {sign.name}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-border/50 text-center">
                <Link href="/rashifal" className="text-[10px] font-medium text-red-600 hover:text-red-700 hover:underline">
                    सभी राशियाँ देखें &rarr;
                </Link>
            </div>
        </div>
    )
}
