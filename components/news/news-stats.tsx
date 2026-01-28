"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Trophy, ArrowUpRight, BarChart3, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NewsStatsProps {
    stats: {
        todaysPosts: number;
        todaysViews: number;
        totalViewsAllTime: number;
        pendingReviewCount: number;
        topPerformer: {
            id: string;
            title: string;
            slug: string;
            publishedAt: Date | null;
            viewsToday: number;
        } | null;
    };
}

export function NewsStats({ stats }: NewsStatsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Today's Posts */}
            <Card className="col-span-1 bg-background/60 backdrop-blur-xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Today's Posts
                    </CardTitle>
                    <div className="p-1.5 bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                        <FileText className="h-3 w-3" />
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold tracking-tight">{stats.todaysPosts}</div>
                    <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                        Articles published today
                    </p>
                </CardContent>
            </Card>

            {/* Today's Views */}
            <Card className="col-span-1 bg-background/60 backdrop-blur-xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Today's Views
                    </CardTitle>
                    <div className="p-1.5 bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                        <Eye className="h-3 w-3" />
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold tracking-tight">{stats.todaysViews.toLocaleString()}</div>
                    <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                        Total views today
                    </p>
                </CardContent>
            </Card>

            {/* Total Views All Time */}
            <Card className="col-span-1 bg-background/60 backdrop-blur-xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Total Views
                    </CardTitle>
                    <div className="p-1.5 bg-purple-500/10 rounded-full text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                        <BarChart3 className="h-3 w-3" />
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold tracking-tight">{stats.totalViewsAllTime.toLocaleString()}</div>
                    <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                        All-time view count
                    </p>
                </CardContent>
            </Card>

            {/* Pending Review */}
            <Card className="col-span-1 bg-background/60 backdrop-blur-xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Pending
                    </CardTitle>
                    <div className="p-1.5 bg-orange-500/10 rounded-full text-orange-600 dark:text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                        <Clock className="h-3 w-3" />
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold tracking-tight">{stats.pendingReviewCount}</div>
                    <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                        Posts awaiting approval
                    </p>
                </CardContent>
            </Card>

            {/* Top Performer - Adjusted to fit grid */}
            <Card className={cn(
                "col-span-2 lg:col-span-1 bg-gradient-to-br from-background/80 to-yellow-500/5 backdrop-blur-xl border-border/40 shadow-sm transition-all duration-300 relative overflow-hidden group",
                stats.topPerformer ? "hover:shadow-md hover:border-yellow-500/30" : ""
            )}>
                {stats.topPerformer && (
                    <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                        <Trophy className="h-32 w-32 rotate-12" />
                    </div>
                )}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        Top Performer
                    </CardTitle>
                    <div className="p-1.5 bg-yellow-500/10 rounded-full text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500/20 transition-colors">
                        <Trophy className="h-3 w-3" />
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                    {stats.topPerformer ? (
                        <div className="space-y-1 relative z-10">
                            <div className="text-xs font-semibold truncate w-full" title={stats.topPerformer.title}>
                                {stats.topPerformer.title}
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <p className="text-[10px] text-muted-foreground">
                                    <span className="font-semibold text-foreground">{stats.topPerformer.viewsToday}</span> views today
                                </p>
                                <Link
                                    href={`/news/${stats.topPerformer.slug}`}
                                    target="_blank"
                                    className="p-1 -mr-2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-lg font-bold text-muted-foreground/30">--</div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">No trending posts</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
