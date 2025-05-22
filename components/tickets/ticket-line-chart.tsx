"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FaQuestion } from "react-icons/fa";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface TicketLineChartCardProps {
  title: string;
  description: string;
  data: {
    date: string;
    tickets: number;
  }[];
}

const chartConfig = {
  tickets: {
    label: "Tickets",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const TicketLineChartCard = ({
  title,
  description,
  data,
}: TicketLineChartCardProps) => {
  // Calculate trend percentage if we have enough data
  const trendInfo = useMemo(() => {
    if (!data || data.length < 2) {
      return { percentage: 0, isUp: true };
    }

    // Get the first and last month's data
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group by month for trend calculation
    const monthlyData = sortedData.reduce((acc, item) => {
      const month = new Date(item.date).toLocaleDateString("en-US", {
        month: "long",
      });
      if (!acc[month]) acc[month] = 0;
      acc[month] += item.tickets;
      return acc;
    }, {} as Record<string, number>);

    const months = Object.keys(monthlyData);
    if (months.length < 2) return { percentage: 0, isUp: true };

    const lastMonth = monthlyData[months[months.length - 1]];
    const previousMonth = monthlyData[months[months.length - 2]];

    if (previousMonth === 0) return { percentage: 0, isUp: true };

    const percentageChange =
      ((lastMonth - previousMonth) / previousMonth) * 100;

    return {
      percentage: Math.abs(Math.round(percentageChange * 10) / 10),
      isUp: percentageChange >= 0,
    };
  }, [data]);

  // Format data for display - convert dates to month names
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      ...item,
      month: new Date(item.date).toLocaleDateString("en-US", { month: "long" }),
    }));
  }, [data]);

  // Get date range for footer
  const dateRange = useMemo(() => {
    if (!data || data.length === 0) return "";

    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstDate = new Date(sortedData[0].date);
    const lastDate = new Date(sortedData[sortedData.length - 1].date);

    return `${firstDate.toLocaleDateString("en-US", {
      month: "long",
    })} - ${lastDate.toLocaleDateString("en-US", {
      month: "long",
    })} ${lastDate.getFullYear()}`;
  }, [data]);

  if (data == null || data.length === 0) {
    return (
      <Card className="p-4 min-h-[200px] w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center flex-col gap-2 justify-center h-full">
          <FaQuestion className="text-gray-500" size={24} />
          <p className="text-md text-gray-500">No data found</p>
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
          <AreaChart
            accessibilityLayer
            data={formattedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="tickets"
              type="natural"
              fill="var(--color-tickets)"
              fillOpacity={0.4}
              stroke="var(--color-tickets)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {trendInfo.percentage > 0 && (
              <div className="flex items-center gap-2 font-medium leading-none">
                {trendInfo.isUp ? "Trending up" : "Trending down"} by{" "}
                {trendInfo.percentage}% this month{" "}
                {trendInfo.isUp ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            )}
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {dateRange}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TicketLineChartCard;
