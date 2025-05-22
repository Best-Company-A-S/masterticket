import { Line, LineChart } from "recharts";
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
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FaQuestion } from "react-icons/fa";

interface TicketLineChartCardProps {
  title: string;
  description: string;
  data: {
    date: string;
    tickets: number;
  }[];
}

const chartConfig = {
  xAxis: {
    label: "Date",
  },
  yAxis: {
    label: "Tickets",
  },
} satisfies ChartConfig;

const TicketLineChartCard = ({
  title,
  description,
  data,
}: TicketLineChartCardProps) => {
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
    <Card className="p-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart data={data}>
            <Line type="monotone" dataKey="tickets" stroke="#8884d8" />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
export default TicketLineChartCard;
