"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
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

interface TicketBarChartProps {
  title: string;
  description: string;
  data: {
    status: string;
    tickets: number;
  }[];
}

// Status color mapping using CSS variables from globals.css
const statusColors = {
  OPEN: "var(--color-chart-1)",
  CLOSED: "var(--color-chart-2)",
  IN_PROGRESS: "var(--color-chart-3)",
  ON_HOLD: "var(--color-chart-4)",
};

const chartConfig = {
  tickets: {
    label: "Tickets",
  },
  OPEN: {
    label: "Open",
    color: "hsl(var(--chart-1))",
  },
  CLOSED: {
    label: "Closed",
    color: "hsl(var(--chart-2))",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "hsl(var(--chart-3))",
  },
  ON_HOLD: {
    label: "On Hold",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const TicketBarChart = ({ title, description, data }: TicketBarChartProps) => {
  // Calculate total tickets and trend
  const totalTickets = React.useMemo(() => {
    return data?.reduce((acc, curr) => acc + curr.tickets, 0) || 0;
  }, [data]);

  // Format data for the pie chart
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      status: item.status,
      tickets: item.tickets,
      fill: statusColors[item.status as keyof typeof statusColors] || "#ccc",
    }));
  }, [data]);

  // Calculate trend percentage - compare open tickets to total
  const trendInfo = React.useMemo(() => {
    if (!data || data.length === 0) return { percentage: 0, isUp: true };

    const openTickets =
      data.find((item) => item.status === "OPEN")?.tickets || 0;
    const totalTickets = data.reduce((acc, curr) => acc + curr.tickets, 0);

    if (totalTickets === 0) return { percentage: 0, isUp: true };

    const percentage = (openTickets / totalTickets) * 100;
    // Lower percentage of open tickets is better
    return {
      percentage: Math.round(percentage),
      isUp: percentage < 30, // If less than 30% are open, it's trending up (good)
    };
  }, [data]);

  if (data == null || data.length === 0) {
    return (
      <Card className="min-h-[200px] min-w-[300px]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center flex-col gap-2 justify-center h-full">
          <FaQuestion className="text-gray-500" size={24} />
          <p className="text-md text-gray-500">No data found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="tickets"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalTickets.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Tickets
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
      <CardFooter className="flex-col gap-2 text-sm">
        {trendInfo.percentage > 0 && (
          <div className="flex items-center gap-2 font-medium leading-none">
            {trendInfo.isUp
              ? "Good ticket distribution"
              : "High percentage of open tickets"}{" "}
            ({trendInfo.percentage}%){" "}
            {trendInfo.isUp ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
        <div className="leading-none text-muted-foreground">
          Showing distribution of tickets by status
        </div>
      </CardFooter>
    </Card>
  );
};

export default TicketBarChart;
