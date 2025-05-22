"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
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
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const TicketLineChartCard = ({
  title,
  description,
  data,
}: TicketLineChartCardProps) => {
  // Determine the time range of the data and format accordingly
  const { formattedData, timeRange, dateRange } = useMemo(() => {
    if (!data || data.length === 0) {
      return { formattedData: [], timeRange: "none", dateRange: "" };
    }

    // Sort data by date
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstDate = new Date(sortedData[0].date);
    const lastDate = new Date(sortedData[sortedData.length - 1].date);

    // Calculate the time difference in days
    const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let timeRange: "hour" | "day" | "week" | "month" = "month";
    let formattedData = [];
    let dateRangeText = "";

    // Determine the appropriate time range based on the data span
    if (diffDays > 60) {
      // If more than 2 months, group by month
      timeRange = "month";

      // Group by month
      const monthlyData = sortedData.reduce((acc, item) => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthName = date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        if (!acc[monthKey]) {
          acc[monthKey] = { month: monthName, tickets: 0, date: item.date };
        }
        acc[monthKey].tickets += item.tickets;
        return acc;
      }, {} as Record<string, { month: string; tickets: number; date: string }>);

      formattedData = Object.values(monthlyData);
      dateRangeText = `${firstDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })} - ${lastDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`;
    } else if (diffDays > 14) {
      // If more than 2 weeks but less than 2 months, group by week
      timeRange = "week";

      // Group by week
      const weeklyData = sortedData.reduce((acc, item) => {
        const date = new Date(item.date);
        // Get the week number (Sunday as first day of week)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!acc[weekKey]) {
          acc[weekKey] = {
            week: `Week of ${weekStart.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}`,
            tickets: 0,
            date: item.date,
          };
        }
        acc[weekKey].tickets += item.tickets;
        return acc;
      }, {} as Record<string, { week: string; tickets: number; date: string }>);

      formattedData = Object.values(weeklyData);
      dateRangeText = `${firstDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${lastDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else if (diffDays > 1) {
      // If more than 1 day but less than 2 weeks, group by day
      timeRange = "day";

      // Group by day
      const dailyData = sortedData.reduce((acc, item) => {
        const date = new Date(item.date);
        const dayKey = date.toISOString().split("T")[0];

        if (!acc[dayKey]) {
          acc[dayKey] = {
            day: date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            tickets: 0,
            date: item.date,
          };
        }
        acc[dayKey].tickets += item.tickets;
        return acc;
      }, {} as Record<string, { day: string; tickets: number; date: string }>);

      formattedData = Object.values(dailyData);
      dateRangeText = `${firstDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${lastDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else {
      // If 1 day or less, group by hour
      timeRange = "hour";

      // Create hourly buckets for the day
      const hourlyData: Record<
        number,
        { hour: string; tickets: number; date: string }
      > = {};

      // Initialize all hours of the day with only the hours we need (not all 24)
      const hours = new Set<number>();

      // First collect all hours that have data
      sortedData.forEach((item) => {
        const date = new Date(item.date);
        hours.add(date.getHours());
      });

      // If we have fewer than 3 hours with data, add some surrounding hours for context
      if (hours.size < 3) {
        const hoursList = Array.from(hours);
        for (const hour of hoursList) {
          if (hour > 0) hours.add(hour - 1);
          if (hour < 23) hours.add(hour + 1);
        }
      }

      // Initialize the hours we'll display
      Array.from(hours)
        .sort((a, b) => a - b)
        .forEach((hour) => {
          hourlyData[hour] = {
            hour: `${hour.toString().padStart(2, "0")}:00`,
            tickets: 0,
            date: new Date(
              firstDate.getFullYear(),
              firstDate.getMonth(),
              firstDate.getDate(),
              hour
            ).toISOString(),
          };
        });

      // Fill in actual data
      sortedData.forEach((item) => {
        const date = new Date(item.date);
        const hour = date.getHours();

        if (hourlyData[hour]) {
          hourlyData[hour].tickets += item.tickets;
        }
      });

      // Convert to array and sort by hour
      formattedData = Object.values(hourlyData).sort((a, b) => {
        return parseInt(a.hour.split(":")[0]) - parseInt(b.hour.split(":")[0]);
      });

      dateRangeText = firstDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    return { formattedData, timeRange, dateRange: dateRangeText };
  }, [data]);

  // Calculate trend percentage based on the time range
  const trendInfo = useMemo(() => {
    if (!formattedData || formattedData.length < 2) {
      return { percentage: 0, isUp: true };
    }

    // For any time range, compare the last period to the one before it
    const lastPeriod = formattedData[formattedData.length - 1].tickets;
    const previousPeriod = formattedData[formattedData.length - 2].tickets;

    if (previousPeriod === 0) return { percentage: 0, isUp: true };

    const percentageChange =
      ((lastPeriod - previousPeriod) / previousPeriod) * 100;

    return {
      percentage: Math.abs(Math.round(percentageChange * 10) / 10),
      isUp: percentageChange >= 0,
    };
  }, [formattedData]);

  // Determine which data key to use based on the time range
  const getDataKey = () => {
    switch (timeRange) {
      case "hour":
        return "hour";
      case "day":
        return "day";
      case "week":
        return "week";
      case "month":
        return "month";
      default:
        return "month";
    }
  };

  // Get appropriate label for the trend based on time range
  const getTrendLabel = () => {
    switch (timeRange) {
      case "hour":
        return "this hour";
      case "day":
        return "today";
      case "week":
        return "this week";
      case "month":
        return "this month";
      default:
        return "this period";
    }
  };

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
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              accessibilityLayer
              data={formattedData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey={getDataKey()}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  if (timeRange === "hour") return value.slice(0, 2);
                  if (timeRange === "day") return value.slice(0, 3);
                  if (timeRange === "week") return `W${value.slice(8, 9)}`;
                  return value.slice(0, 3); // Month
                }}
              />
              <YAxis
                domain={[0, "auto"]}
                allowDecimals={false}
                hide={formattedData.length <= 1}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="tickets"
                type="monotone"
                fill="var(--color-primary)"
                fillOpacity={0.2}
                stroke="var(--color-primary)"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {trendInfo.percentage > 0 && (
              <div className="flex items-center gap-2 font-medium leading-none">
                {trendInfo.isUp ? "Trending up" : "Trending down"} by{" "}
                {trendInfo.percentage}% {getTrendLabel()}{" "}
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
