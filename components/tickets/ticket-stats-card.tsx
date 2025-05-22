import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TicketStatsCardProps {
  title: string;
  value: number;
  description: string;
  unit?: string;
}

const TicketStatsCard = ({
  title,
  value,
  description,
  unit,
}: TicketStatsCardProps) => {
  return (
    <Card className="p-4 w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {value}
          {unit && <span className="text-lg ml-1">{unit}</span>}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
};

export default TicketStatsCard;
