"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, MessageSquare } from "lucide-react";
import { useTickets, Ticket } from "@/lib/hooks/use-tickets";
import { formatDistanceToNow } from "date-fns";

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getTicket, isLoading, error } = useTickets();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (params.id) {
        const result = await getTicket(params.id as string);
        if (result) {
          setTicket(result);
        }
      }
    };

    fetchTicket();
  }, [params.id, getTicket]);

  // Format response time from hours to a readable format
  const formatResponseTime = (hours: number | null): string => {
    if (hours === null) return "Not yet responded";

    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10} hours`;
    } else {
      return `${Math.round((hours / 24) * 10) / 10} days`;
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      case "CLOSED":
        return "outline";
      case "ON_HOLD":
        return "destructive";
      default:
        return "default";
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "outline";
      case "MEDIUM":
        return "secondary";
      case "HIGH":
        return "default";
      case "CRITICAL":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to tickets
        </Button>
        <h1 className="text-2xl font-bold">Ticket Details</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading ticket details...</div>
      ) : error ? (
        <div className="text-red-500 p-8">{error}</div>
      ) : ticket ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <div className="text-sm text-muted-foreground">Ticket ID</div>
                <CardTitle className="text-xl">#{ticket.id}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(ticket.status)}>
                  {ticket.status.replace("_", " ")}
                </Badge>
                <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{ticket.title}</h2>
                  <div className="text-sm text-muted-foreground mt-1">
                    Created {formatDistanceToNow(new Date(ticket.createdAt))}{" "}
                    ago
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Description</div>
                    <p className="mt-1 whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Response Time</div>
                        <div>
                          {formatResponseTime(ticket.responseTime || null)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Comments</div>
                        <div>{(ticket as any).commentCount || 0} comments</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                Comments feature coming soon...
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center p-8">Ticket not found</div>
      )}
    </div>
  );
}
