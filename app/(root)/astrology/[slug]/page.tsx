import { notFound } from "next/navigation"
import Link from "next/link"
import { getRashifalBySlug } from "@/lib/data/rashifal-data"
import { getHoroscope } from "@/lib/services/horoscope-service"
import { ArrowLeft, Heart, Briefcase, Activity, Share2, Calendar } from "lucide-react"

import { ZodiacStrip } from "@/components/rashifal/zodiac-strip"

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function RashifalDetailPage(props: PageProps) {
    const params = await props.params;
    const { slug } = params;
    const staticData = getRashifalBySlug(slug)

    if (!staticData) {
        notFound()
    }

    // Fetch dynamic predictions
    const predictions = await getHoroscope(slug);

    const currentDate = new Date().toLocaleDateString("hi-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="min-h-screen bg-[#FFFDF5] dark:bg-slate-950 relative overflow-x-hidden font-sans selection:bg-orange-100 selection:text-orange-900">
            {/* Background Pattern - Modern Mandala Effect */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-orange-50/80 to-transparent dark:from-orange-900/10" />
                <div className="absolute -top-[10%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full border-[2px] border-orange-200/20 dark:border-orange-900/10 opacity-60 animate-[spin_120s_linear_infinite]" />
                <div className="absolute -top-[15%] left-[50%] -translate-x-1/2 w-[1000px] h-[1000px] rounded-full border-[1px] border-red-200/20 dark:border-red-900/10 opacity-40 animate-[spin_100s_linear_infinite_reverse]" />
            </div>

            <div className="relative z-10">


                {/* Cultural Hero Section */}
                <div className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white overflow-hidden shadow-lg border-b-4 border-yellow-500/50">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10 mix-blend-overlay" />
                    <div className="absolute -bottom-10 -right-10 text-9xl opacity-10 rotate-12">{staticData.icon}</div>

                    <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-6 justify-center md:justify-start">
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/10 backdrop-blur-md border-[3px] border-yellow-400/50 flex items-center justify-center text-5xl md:text-6xl shadow-2xl relative z-10">
                                    {staticData.icon}
                                </div>
                                <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 animate-pulse" />
                            </div>

                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3 text-orange-100 font-bold tracking-widest uppercase text-xs mb-1">
                                    <span>{staticData.englishName}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                    <span>{staticData.dateRange}</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black font-khand-font mb-2 drop-shadow-sm text-white">
                                    {staticData.name} राशिफल
                                </h1>
                                <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
                                    <Calendar className="w-4 h-4 text-yellow-400" />
                                    <p className="text-sm font-medium text-white/90">{currentDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Strip Container */}
                <div className="sticky top-0 z-40 bg-[#FFFDF5]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-orange-100 dark:border-slate-800 shadow-sm">
                    <div className="container mx-auto py-2">
                        <ZodiacStrip activeSlug={slug} />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Sidebar: Daily Insight (Patra Style) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md border border-orange-100 dark:border-slate-800 relative">
                                <div className="h-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
                                <div className="p-6">
                                    <h2 className="font-bold text-xl mb-4 font-khand-font text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                        <span className="text-orange-500 text-2xl">⚡</span>
                                        आज का विचार (Daily Thought)
                                    </h2>
                                    <div className="relative">
                                        <span className="absolute -top-2 -left-2 text-6xl text-orange-100 dark:text-orange-900/20 font-serif leading-none">“</span>
                                        <p className="text-slate-700 dark:text-slate-300 leading-loose italic text-lg relative z-10 px-2 font-medium">
                                            {// Use the overall generic prediction (Hindi)
                                                predictions.overall.includes("English Insight") ? predictions.overall.split('(')[0] : predictions.overall
                                            }
                                        </p>
                                        <span className="absolute -bottom-4 -right-2 text-6xl text-orange-100 dark:text-orange-900/20 font-serif leading-none rotate-180">“</span>
                                    </div>

                                    {/* API Specific Insight if available */}
                                    {predictions.meta.description && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                                                English Insight: "{predictions.meta.description}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Lucky Factors Grid - Dynamic API Data */}
                                <div className="bg-orange-50/50 dark:bg-slate-800/50 p-4 border-t border-orange-100 dark:border-slate-700">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-orange-200/50 dark:border-slate-700 text-center">
                                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">शुभ रंग (Color)</div>
                                            <div className="text-orange-600 dark:text-orange-400 font-bold capitalize">{predictions.meta.color}</div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-orange-200/50 dark:border-slate-700 text-center">
                                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">शुभ अंक (Number)</div>
                                            <div className="text-orange-600 dark:text-orange-400 font-bold">{predictions.meta.lucky_number}</div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-orange-200/50 dark:border-slate-700 text-center col-span-2">
                                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">आज का मूड (Mood)</div>
                                            <div className="text-orange-600 dark:text-orange-400 font-bold capitalize">{predictions.meta.mood}</div>
                                        </div>
                                    </div>
                                    {/* <button className="w-full mt-4 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
                                        <Share2 className="h-4 w-4" /> दोस्तों के साथ साझा करें
                                    </button> */}
                                </div>
                            </div>
                        </div>

                        {/* Right Content: Detailed Predictions */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="h-8 w-1 bg-red-600 rounded-full" />
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white font-khand-font">
                                    {predictions.title}
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {/* Love Card - Pink Theme */}
                                <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border-l-4 border-l-rose-500 border-y border-r border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-full text-rose-600 shrink-0 mt-1 ring-1 ring-rose-200 dark:ring-rose-800">
                                            <Heart className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl text-rose-700 dark:text-rose-400 mb-2 font-khand-font">प्रेम (Love)</h4>
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                                                {predictions.love}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Career Card - Blue Theme */}
                                <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border-l-4 border-l-blue-600 border-y border-r border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 shrink-0 mt-1 ring-1 ring-blue-200 dark:ring-blue-800">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl text-blue-700 dark:text-blue-400 mb-2 font-khand-font">करियर (Career)</h4>
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                                                {predictions.career}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Health Card - Green Theme */}
                                <div className="group bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border-l-4 border-l-emerald-600 border-y border-r border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600 shrink-0 mt-1 ring-1 ring-emerald-200 dark:ring-emerald-800">
                                            <Activity className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl text-emerald-700 dark:text-emerald-400 mb-2 font-khand-font">सेहत (Health)</h4>
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                                                {predictions.health}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
