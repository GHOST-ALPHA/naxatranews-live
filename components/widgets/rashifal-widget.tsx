"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, ArrowRight, Star } from "lucide-react"
import { getDailyPrediction } from "@/lib/utils/rashifal-utils"

const ZODIAC_SIGNS = [
    { name: "मेष", slug: "mesh", icon: "♈", color: "text-red-500", label: "Aries" },
    { name: "वृष", slug: "vrish", icon: "♉", color: "text-emerald-600", label: "Taurus" },
    { name: "मिथुन", slug: "mithun", icon: "♊", color: "text-amber-500", label: "Gemini" },
    { name: "कर्क", slug: "kark", icon: "♋", color: "text-blue-500", label: "Cancer" },
    { name: "सिंह", slug: "singh", icon: "♌", color: "text-orange-500", label: "Leo" },
    { name: "कन्या", slug: "kanya", icon: "♍", color: "text-green-600", label: "Virgo" },
    { name: "तुला", slug: "tula", icon: "♎", color: "text-indigo-500", label: "Libra" },
    { name: "वृश्चिक", slug: "vrishchik", icon: "♏", color: "text-rose-500", label: "Scorpio" },
    { name: "धनु", slug: "dhanu", icon: "♐", color: "text-orange-600", label: "Sagittarius" },
    { name: "मकर", slug: "makar", icon: "♑", color: "text-cyan-700", label: "Capricorn" },
    { name: "कुंभ", slug: "kumbh", icon: "♒", color: "text-sky-500", label: "Aquarius" },
    { name: "मीन", slug: "meen", icon: "♓", color: "text-violet-600", label: "Pisces" },
]

export function RashifalWidget() {
    const [hoveredSign, setHoveredSign] = useState<string | null>(null);
    const [todaySign, setTodaySign] = useState(ZODIAC_SIGNS[0]);

    useEffect(() => {
        const day = new Date().getDate();
        setTodaySign(ZODIAC_SIGNS[day % ZODIAC_SIGNS.length]);
    }, []);

    const activeSign = (hoveredSign ? ZODIAC_SIGNS.find(s => s.slug === hoveredSign) : todaySign) || todaySign;

    return (
        <div className="w-full rounded-[1rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800/50 overflow-hidden group/widget transition-all duration-700 hover:shadow-red-500/10">
            {/* Premium Animated Header */}
            <div className="relative bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 px-7 py-4 overflow-hidden">

                <div className="relative flex items-center justify-between z-10">
                    <div className="flex items-center gap-3.5">
                        <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/40 shadow-xl">
                            <Sparkles className="h-5 w-5 text-yellow-200 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white tracking-tight font-khand-font leading-none">आज का राशिफल</h3>
                        </div>
                    </div>
                </div>
            </div>



            {/* Responsive Premium Grid */}
            <div className="p-7 grid grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6 border-y border-slate-100 dark:border-slate-800/40">
                {ZODIAC_SIGNS.map((sign) => {
                    const isActive = hoveredSign === sign.slug || (!hoveredSign && todaySign.slug === sign.slug);
                    return (
                        <Link
                            key={sign.slug}
                            href={`/astrology/${sign.slug}`}
                            onMouseEnter={() => setHoveredSign(sign.slug)}
                            onMouseLeave={() => setHoveredSign(null)}
                            className={`
                                group/item flex flex-col items-center justify-center p-1 transition-all duration-500
                                ${isActive ? 'scale-110 -translate-y-1' : 'hover:scale-110 hover:-translate-y-1'}
                            `}
                        >
                            <div className={`
                                relative  flex items-center justify-center transition-all duration-500
                                ${isActive
                                    ? 'shadow-[0_20px_40px_-5px_rgba(239,68,68,0.25)] ring-[8px] ring-red-50 dark:ring-red-900/20 border-2 border-red-100 dark:border-red-900/30'
                                    : 'shadow-sm group-hover/item:shadow-2xl group-hover/item:border-red-300 group-hover/item:bg-white'
                                }
                            `}>
                                <span className={`text-3xl transition-all duration-500 ${sign.color} ${isActive ? 'scale-125 drop-shadow-xl saturate-150' : 'grayscale-[0.3] group-hover/item:grayscale-0 group-hover/item:scale-125'}`}>
                                    {sign.icon}
                                </span>
                            </div>

                            <span className={`mt-3 text-[11px] font-black tracking-[0.1em] transition-colors duration-300 uppercase ${isActive ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-500 group-hover/item:text-red-600'}`}>
                                {sign.name}
                            </span>
                        </Link>
                    );
                })}
            </div>


        </div>
    )
}
