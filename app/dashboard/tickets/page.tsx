"use client";

import { useEffect, useState } from "react";
import TicketSearchBar from "@/components/tickets/ticket-search-bar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tickets/data-table";
import { columns, Ticket as UITicket } from "@/components/tickets/columns";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { PlusCircle } from "lucide-react";
import { useTickets, Ticket as ApiTicket } from "@/lib/hooks/use-tickets";

export default function TicketsPage() {
  const { tickets, isLoading, error, getTickets } = useTickets();
  const [filteredData, setFilteredData] = useState<UITicket[]>([]);

  // Map API tickets to UI tickets format
  const mapApiTicketsToUiTickets = (apiTickets: ApiTicket[]): UITicket[] => {
    return apiTickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      assignedAgent: "Unassigned", // This field doesn't exist in API ticket
      resolutionTime: ticket.responseTime ? `${ticket.responseTime} ms` : "N/A",
    }));
  };

  useEffect(() => {
    getTickets();
  }, [getTickets]);

  useEffect(() => {
    if (tickets && tickets.length > 0) {
      const uiTickets = mapApiTicketsToUiTickets(tickets);
      setFilteredData(uiTickets);
    }
  }, [tickets]);

  // Filter handlers
  const handleStatusFilter = (statuses: string[]) => {
    if (!tickets) return;

    if (statuses.length === 0) {
      setFilteredData(mapApiTicketsToUiTickets(tickets));
    } else {
      const filtered = tickets.filter((ticket) =>
        statuses.includes(ticket.status)
      );
      setFilteredData(mapApiTicketsToUiTickets(filtered));
    }
  };

  const handlePriorityFilter = (priorities: string[]) => {
    if (!tickets) return;

    if (priorities.length === 0) {
      setFilteredData(mapApiTicketsToUiTickets(tickets));
    } else {
      const filtered = tickets.filter((ticket) =>
        priorities.includes(ticket.priority)
      );
      setFilteredData(mapApiTicketsToUiTickets(filtered));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-4xl font-bold">Support Tickets</h1>
          <p className="text-sm text-gray-500">
            Manage and track all incoming support requests from customers and
            internal teams.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Ticket
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <TicketSearchBar />
      </div>

      <div className="mt-5">
        <TicketFilters
          onStatusChange={handleStatusFilter}
          onPriorityChange={handlePriorityFilter}
        />
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="flex justify-center p-8">Loading tickets...</div>
        ) : error ? (
          <div className="text-red-500 p-8">{error}</div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
      </div>
    </div>
  );
}
