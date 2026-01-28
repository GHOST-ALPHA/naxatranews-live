"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell, Label } from "recharts";

interface DevicePieChartProps {
  data: Array<{
    device?: string;
    browser?: string;
    os?: string;
    count: number;
  }>;
  title: string;
  description: string;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function DevicePieChart({ data, title, description }: DevicePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Get the name key (device, browser, or os)
  const getName = (item: typeof data[0]) => item.device || item.browser || item.os || "Unknown";
  
  // Normalize data to have a consistent 'name' field
  const normalizedData = data.map(item => ({
    name: getName(item),
    count: item.count,
  }));

  const chartConfig = normalizedData.reduce((acc, item, index) => {
    const key = item.name.toLowerCase().replace(/\s+/g, "");
    acc[key] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  if (total === 0 || normalizedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
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
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={normalizedData}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name}: ${((percent * 100).toFixed(1))}%`
              }
            >
              {normalizedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
              <Label
                value={`Total: ${total}`}
                position="center"
                className="text-sm font-medium"
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

