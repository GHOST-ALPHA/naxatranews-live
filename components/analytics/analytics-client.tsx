"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/analytics/stat-card";
import { VisitsChart } from "@/components/analytics/visits-chart";
import { NewsViewsChart } from "@/components/analytics/news-views-chart";
import { DevicePieChart } from "@/components/analytics/device-pie-chart";
import { TopNewsTable } from "@/components/analytics/top-news-table";
import { AdPerformanceTable } from "@/components/analytics/ad-performance-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Eye, FileText, MousePointerClick, TrendingUp } from "lucide-react";
import PageContainer from "@/components/layout/page-container";

interface AnalyticsClientProps {
  initialData: any;
  initialDays: number;
}

export function AnalyticsClient({ initialData, initialDays }: AnalyticsClientProps) {
  const router = useRouter();
  const [days, setDays] = useState(initialDays);

  const handleDaysChange = (value: string) => {
    const newDays = Number(value);
    setDays(newDays);
    router.push(`/dashboard/analytics?days=${newDays}`);
  };

  const overview = initialData.overview || {};
  const visits = initialData.visits?.stats || [];
  const newsStats = initialData.news?.dailyStats || [];
  const topNews = initialData.news?.topNews || [];
  const adStats = initialData.advertisements?.advertisements || [];
  const devices = initialData.devices?.devices || [];
  const browsers = initialData.devices?.browsers || [];
  const os = initialData.devices?.os || [];

  // Format visits data for chart
  const visitsChartData = Array.isArray(visits) ? visits.map((item: any) => ({
    date: item.date,
    uniqueVisits: Number(item.uniqueVisits) || 0,
    totalVisits: Number(item.totalVisits) || 0,
  })) : [];

  // Format news views data for chart
  const newsViewsChartData = Array.isArray(newsStats) ? newsStats.map((item: any) => ({
    date: item.date,
    views: Number(item.views) || 0,
  })) : [];

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Overview</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive analytics dashboard for Bawal News
            </p>
          </div>
          <Select value={String(days)} onValueChange={handleDaysChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Unique Visits"
            value={Number(overview.todayUniqueVisits) || 0}
            icon={Users}
            description={`${Number(overview.todayTotalVisits) || 0} total visits`}
          />
          <StatCard
            title="Today's News Views"
            value={Number(overview.todayNewsViews) || 0}
            icon={Eye}
            description="News post views today"
          />
          <StatCard
            title="Total News Posts"
            value={Number(overview.totalNews) || 0}
            icon={FileText}
            description={`${Number(overview.publishedNews) || 0} published`}
          />
          <StatCard
            title="Active Advertisements"
            value={Number(overview.activeAds) || 0}
            icon={MousePointerClick}
            description="Currently active ads"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-4 md:grid-cols-2">
          <VisitsChart data={visitsChartData} />
          <NewsViewsChart data={newsViewsChartData} />
        </div>

        {/* Device Statistics */}
        {(devices.length > 0 || browsers.length > 0 || os.length > 0) && (
          <div className="grid gap-4 md:grid-cols-3">
            {devices.length > 0 && (
              <DevicePieChart data={devices} title="Devices" description="Visits by device type" />
            )}
            {browsers.length > 0 && (
              <DevicePieChart data={browsers} title="Browsers" description="Visits by browser" />
            )}
            {os.length > 0 && (
              <DevicePieChart
                data={os}
                title="Operating Systems"
                description="Visits by OS"
              />
            )}
          </div>
        )}

        {/* Tables Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {topNews.length > 0 && <TopNewsTable data={topNews} />}
          {adStats.length > 0 && <AdPerformanceTable data={adStats} />}
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Unique Visits"
            value={Number(initialData.visits?.totalUniqueVisits) || 0}
            icon={Users}
            description={`Last ${days} days`}
          />
          <StatCard
            title="Total Visits"
            value={Number(initialData.visits?.totalVisits) || 0}
            icon={TrendingUp}
            description={`Last ${days} days`}
          />
          <StatCard
            title="Total News Views"
            value={Number(initialData.news?.totalViews) || 0}
            icon={Eye}
            description={`${Number(initialData.news?.uniqueNewsPosts) || 0} unique posts`}
          />
        </div>
      </div>
    </PageContainer>
  );
}

