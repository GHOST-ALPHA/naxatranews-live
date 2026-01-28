"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStatsProps {
    stats: {
        totalUsers: number;
        activeUsers: number;
        newUsersToday: number;
        roleStats: Array<{
            name: string;
            count: number;
        }>;
    };
}

export function UserStats({ stats }: UserStatsProps) {
    // Calculate potential growth percentage (mock calculation or based on newUsersToday vs total)
    // For now, we'll just show the raw numbers

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Total Users */}
            <Card className="col-span-1 bg-background/60 backdrop-blur-xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Total Users
                    </CardTitle>
                    <div className="p-1.5 bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                        <Users className="h-3 w-3" />
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold tracking-tight">{stats.totalUsers.toLocaleString()}</div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                        Registered accounts
                    </p>
                </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="col-span-1 bg-background/60 backdrop-blur-xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Active Users
                    </CardTitle>
                    <div className="p-1.5 bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                        <UserCheck className="h-3 w-3" />
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold tracking-tight">{stats.activeUsers.toLocaleString()}</div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                        Currently active
                    </p>
                </CardContent>
            </Card>

            {/* New Users Today */}
            <Card className="col-span-1 bg-background/60 backdrop-blur-xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        New Today
                    </CardTitle>
                    <div className="p-1.5 bg-purple-500/10 rounded-full text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                        <UserPlus className="h-3 w-3" />
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold tracking-tight">{stats.newUsersToday.toLocaleString()}</div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                        Joined in last 24h
                    </p>
                </CardContent>
            </Card>

            {/* Roles Distribution - Simplified to just show main role or total roles */}
            <Card className="col-span-1 bg-background/60 backdrop-blur-xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                    <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Admins & Staff
                    </CardTitle>
                    <div className="p-1.5 bg-orange-500/10 rounded-full text-orange-600 dark:text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                        <Shield className="h-3 w-3" />
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                    {/* Summing up non-user roles approximately, or just showing the first 2 stats */}
                    <div className="flex gap-2 text-xs">
                        {stats.roleStats.slice(0, 2).map((role, idx) => (
                            <div key={idx} className="flex flex-col">
                                <span className="font-bold text-lg">{role.count}</span>
                                <span className="text-[8px] text-muted-foreground uppercase">{role.name}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
