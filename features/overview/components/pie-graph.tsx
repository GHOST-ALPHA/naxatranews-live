'use client';

import * as React from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import { Cell, Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface PieGraphProps {
  data?: Array<{ author: string; count: number; fill?: string }>;
  total?: number;
}

// Color palette for authors - using distinct colors for better visibility
const colors = [
  'hsl(142, 76%, 36%)',      // Green (primary)
  'hsl(217, 91%, 60%)',      // Blue
  'hsl(280, 67%, 56%)',      // Purple
  'hsl(0, 72%, 51%)',        // Red
  'hsl(38, 92%, 50%)',       // Orange/Yellow
  'hsl(199, 89%, 48%)',      // Cyan
  'hsl(271, 81%, 56%)',      // Magenta
  'hsl(24, 95%, 53%)',       // Orange
];

export function PieGraph({ data = [], total = 0 }: PieGraphProps) {
  const chartData = React.useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: item.fill || colors[index % colors.length],
      authors: item.author,
    }));
  }, [data]);

  const totalPosts = total || React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  // Build chart config from data
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      posts: {
        label: 'Posts'
      }
    };
    chartData.forEach((item) => {
      config[item.author] = {
        label: item.author,
        color: item.fill || 'var(--primary)'
      };
    });
    return config;
  }, [chartData]);

  if (!chartData || chartData.length === 0) {
    return (
      <Card className='@container/card'>
        <CardHeader>
          <CardTitle>Pie Chart - Donut with Text</CardTitle>
          <CardDescription>News posts by author</CardDescription>
        </CardHeader>
        <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
          <div className='flex h-[250px] items-center justify-center text-muted-foreground'>
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const topAuthor = chartData[0];
  const topAuthorPercentage = totalPosts > 0
    ? ((topAuthor.count / totalPosts) * 100).toFixed(1)
    : '0';

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Pie Chart - Donut with Text</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            News posts distribution by author
          </span>
          <span className='@[540px]/card:hidden'>Author distribution</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='count'
              nameKey='author'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}-${entry.author}`}
                  fill={entry.fill || colors[index % colors.length]}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalPosts.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Posts
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-3 text-sm'>
        {topAuthor && (
          <div className='flex items-center gap-2 leading-none font-medium'>
            {topAuthor.author} leads with {topAuthorPercentage}%{' '}
            <IconTrendingUp className='h-4 w-4' />
          </div>
        )}
        {/* Author legend with colors */}
        <div className='flex flex-wrap gap-3 w-full'>
          {chartData.map((item, index) => {
            const percentage = totalPosts > 0 
              ? ((item.count / totalPosts) * 100).toFixed(1) 
              : '0';
            return (
              <div 
                key={item.author} 
                className='flex items-center gap-2 text-xs'
                title={`${item.author}: ${item.count} posts (${percentage}%)`}
              >
                <div 
                  className='w-3 h-3 rounded-full flex-shrink-0' 
                  style={{ backgroundColor: item.fill }}
                />
                <span className='text-muted-foreground truncate max-w-[120px]'>
                  {item.author}
                </span>
                <span className='font-medium'>{percentage}%</span>
              </div>
            );
          })}
        </div>
        <div className='text-muted-foreground leading-none text-xs'>
          Top {chartData.length} author{chartData.length !== 1 ? 's' : ''} by post count
        </div>
      </CardFooter>
    </Card>
  );
}
