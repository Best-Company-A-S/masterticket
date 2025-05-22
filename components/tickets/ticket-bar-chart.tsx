import { Bar, BarChart } from "recharts";
import { ChartConfig, ChartContainer } from "../ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FaQuestion, FaQuestionCircle } from "react-icons/fa";

interface TicketBarChartProps {
  title: string;
  description: string;
  data: {
    status: string;
    tickets: number;
  }[];
}

const TicketBarChart = ({ title, description, data }: TicketBarChartProps) => {
  const chartConfig = {
    xAxis: {
      label: "Status",
    },
    yAxis: {
      label: "Tickets",
    },
  } satisfies ChartConfig;

  if (data == null || data.length === 0) {
    return (
      <Card className="p-4 min-h-[200px] min-w-[300px]">
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
    <Card className="p-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={data}>
            <Bar dataKey="open" fill="#8884d8" />
            <Bar dataKey="closed" fill="#82ca9d" />
            <Bar dataKey="inProgress" fill="#ffc658" />
            <Bar dataKey="onHold" fill="#ff7300" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TicketBarChart;
