"use client";

import TicketBarChart from "@/components/tickets/ticket-bar-chart";
import TicketLineChartCard from "@/components/tickets/ticket-line-chart";
import TicketStatsCard from "@/components/tickets/ticket-stats-card";
import { useSession } from "@/lib/auth-client";
import { useOrganization } from "@/lib/hooks/use-organization";
import { useTickets } from "@/lib/hooks/use-tickets";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { activeOrganization } = useOrganization();
  const { tickets } = useTickets();

  return (
    <div className="p-6">
      <div className="flex flex-col items-start gap-10">
        <div className="flex items-start justify-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Welcome, {session?.user?.name}! You are viewing the dashboard for{" "}
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
            value={0}
            description="Average response time for the organization"
          />

          <TicketStatsCard
            title="Open Tickets"
            value={tickets.filter((ticket) => ticket.status === "OPEN").length}
            description="Number of open tickets in the organization"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          {/* Ticket over time */}
          <TicketLineChartCard
            title="Ticket over time"
            description="Number of tickets over time"
            data={tickets.map((ticket) => ({
              date: ticket.createdAt.toISOString(),
              tickets: 1,
            }))}
          />

          {/* Ticket By Status */}
          <TicketBarChart
            title="Ticket By Status"
            description="Number of tickets by status"
            data={tickets.map((ticket) => ({
              status: ticket.status,
              tickets: 1,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
