"use client";

import { useCallback, useState } from "react";
import { useOrganization } from "./use-organization";

export enum TicketStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  IN_PROGRESS = "IN_PROGRESS",
  ON_HOLD = "ON_HOLD",
}

export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
}

export interface UpdateTicketInput {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
}

export function useTickets() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeOrganization } = useOrganization();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const getTickets = useCallback(async () => {
    if (!activeOrganization) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/ticket", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId: activeOrganization.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization]);

  const getTicket = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/ticket/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ticket");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTicket = useCallback(
    async (input: CreateTicketInput) => {
      if (!activeOrganization) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/v1/ticket", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...input,
            organizationId: activeOrganization.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create ticket");
        }

        const newTicket = await response.json();
        setTickets((prev) => [...prev, newTicket]);
        return newTicket;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [activeOrganization]
  );

  const updateTicket = useCallback(async (input: UpdateTicketInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/ticket/${input.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("Failed to update ticket");
      }

      const updatedTicket = await response.json();
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );
      return updatedTicket;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTicket = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/ticket/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete ticket");
      }

      const deletedTicket = await response.json();
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
      return deletedTicket;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tickets,
    isLoading,
    error,
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
  };
}
