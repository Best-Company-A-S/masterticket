"use client";

import { useEffect, useState } from "react";
import TicketSearchBar from "@/components/tickets/ticket-search-bar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tickets/data-table";
import { columns, Ticket as UITicket } from "@/components/tickets/columns";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { PlusCircle, Clock } from "lucide-react";
import { useTickets, Ticket as ApiTicket } from "@/lib/hooks/use-tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateTicketModal from "@/components/tickets/create-ticket-modal";

export default function TicketsPage() {
  const { tickets, stats, isLoading, error, getTickets } = useTickets();
  const [filteredData, setFilteredData] = useState<UITicket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);

  // Map API tickets to UI tickets format
  const mapApiTicketsToUiTickets = (apiTickets: ApiTicket[]): UITicket[] => {
    return apiTickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      resolutionTime: ticket.responseTime
        ? `${formatResponseTime(ticket.responseTime)}`
        : "N/A",
      commentCount: (ticket as any).commentCount || 0,
      assignedToUser: ticket.assignedToUser,
      assignedToTeam: ticket.assignedToTeam,
    }));
  };

  // Format response time from hours to a readable format
  const formatResponseTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10} hrs`;
    } else {
      return `${Math.round((hours / 24) * 10) / 10} days`;
    }
  };

  // Format average response time for display
  const formatAverageResponseTime = (hours: number | null): string => {
    if (hours === null) return "N/A";
    return formatResponseTime(hours);
  };

  useEffect(() => {
    getTickets();
  }, [getTickets]);

  // Apply all filters when tickets or filter states change
  useEffect(() => {
    if (!tickets || tickets.length === 0) return;

    let filtered = [...tickets];

    // Apply status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((ticket) =>
        selectedStatuses.includes(ticket.status)
      );
    }

    // Apply priority filter
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter((ticket) =>
        selectedPriorities.includes(ticket.priority)
      );
    }

    // Apply assignment filter
    if (selectedAssignments.length > 0) {
      filtered = filtered.filter((ticket) => {
        if (selectedAssignments.includes("unassigned")) {
          if (!ticket.assignedToUserId && !ticket.assignedToTeamId) {
            return true;
          }
        }
        if (selectedAssignments.includes("user")) {
          if (ticket.assignedToUserId) {
            return true;
          }
        }
        if (selectedAssignments.includes("team")) {
          if (ticket.assignedToTeamId) {
            return true;
          }
        }
        return false;
      });
    }

    setFilteredData(mapApiTicketsToUiTickets(filtered));
  }, [tickets, selectedStatuses, selectedPriorities, selectedAssignments]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);

    // If search term is empty, reset to show all tickets
    if (!term && tickets) {
      // Don't reset filters, just update the search term
      // Filters will be applied in the useEffect
    }
  };

  // Handle ticket creation
  const handleTicketCreated = () => {
    getTickets();
  };

  // Filter handlers
  const handleStatusFilter = (statuses: string[]) => {
    setSelectedStatuses(statuses);
  };

  const handlePriorityFilter = (priorities: string[]) => {
    setSelectedPriorities(priorities);
  };

  const handleAssignmentFilter = (assignments: string[]) => {
    setSelectedAssignments(assignments);
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
          <CreateTicketModal onTicketCreated={handleTicketCreated} />
        </div>
      </div>

      <div className="mt-5">
        <TicketSearchBar onSearch={handleSearch} />
      </div>

      <div className="mt-5">
        <TicketFilters
          onStatusChange={handleStatusFilter}
          onPriorityChange={handlePriorityFilter}
          onAssignmentChange={handleAssignmentFilter}
        />
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="flex justify-center p-8">Loading tickets...</div>
        ) : error ? (
          <div className="text-red-500 p-8">{error}</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </div>
  );
}
