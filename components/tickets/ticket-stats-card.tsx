import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TicketStatsCardProps {
  title: string;
  value: number;
  description: string;
}

const TicketStatsCard = ({
  title,
  value,
  description,
}: TicketStatsCardProps) => {
  return (
    <Card className="p-4 w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
};

export default TicketStatsCard;
