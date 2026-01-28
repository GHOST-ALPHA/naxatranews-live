"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

interface NewsViewsChartProps {
  data: Array<{
    date: string;
    views: number;
  }>;
}

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function NewsViewsChart({ data }: NewsViewsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News Views</CardTitle>
          <CardDescription>Daily news post views</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>News Views</CardTitle>
        <CardDescription>Daily news post views</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="views" fill="var(--color-views)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

