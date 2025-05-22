"use client";

import TicketBarChart from "@/components/tickets/ticket-bar-chart";
import TicketLineChartCard from "@/components/tickets/ticket-line-chart";
import TicketStatsCard from "@/components/tickets/ticket-stats-card";
import { useSession } from "@/lib/auth-client";
import { useOrganization } from "@/lib/hooks/use-organization";
import { useTickets, TicketStatus } from "@/lib/hooks/use-tickets";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { activeOrganization } = useOrganization();
  const { tickets, isLoading, error, getTickets } = useTickets();

  useEffect(() => {
    if (activeOrganization) {
      getTickets();
    }
  }, [activeOrganization, getTickets]);

  // Calculate statistics
  const openTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.OPEN
  );
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.IN_PROGRESS
  );
  const closedTickets = tickets.filter(
    (ticket) => ticket.status === TicketStatus.CLOSED
  );

  // Calculate average response time (placeholder - would need actual response time data)
  const avgResponseTime = 24; // hours (placeholder)

  // Group tickets by status for bar chart
  const ticketsByStatus = Object.values(TicketStatus).map((status) => ({
    status,
    tickets: tickets.filter((ticket) => ticket.status === status).length,
  }));

  // Prepare data for line chart - group by date
  const ticketsByDate = tickets.reduce((acc, ticket) => {
    const date = new Date(ticket.createdAt).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = { date, tickets: 0 };
    }
    acc[date].tickets += 1;
    return acc;
  }, {} as Record<string, { date: string; tickets: number }>);

  const lineChartData = Object.values(ticketsByDate).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="p-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading ticket data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6">
          <p>Error loading tickets: {error}</p>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-10">
          <div className="flex items-start justify-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold">Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome, {session?.user?.name}! You are viewing the dashboard
                for{" "}
                <span className="font-bold text-primary">
                  {activeOrganization?.name}
                </span>
                .
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            <TicketStatsCard
              title="Total Tickets"
              value={tickets.length}
              description="Total number of tickets in the organization"
            />

            <TicketStatsCard
              title="Avg. Response Time"
              value={avgResponseTime}
              description="Average response time in hours"
              unit="h"
            />

            <TicketStatsCard
              title="Open Tickets"
              value={openTickets.length}
              description={`${
                openTickets.length > 0
                  ? Math.round((openTickets.length / tickets.length) * 100)
                  : 0
              }% of total tickets`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {/* Ticket over time */}
            <TicketLineChartCard
              title="Tickets over time"
              description="Number of tickets created per day"
              data={lineChartData}
            />

            {/* Ticket By Status */}
            <TicketBarChart
              title="Tickets By Status"
              description="Distribution of tickets by current status"
              data={ticketsByStatus}
            />
          </div>
        </div>
      )}
    </div>
  );
}
