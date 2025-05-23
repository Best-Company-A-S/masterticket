"use client";

import { useCallback, useState } from "react";
import { useOrganization } from "./use-organization";
import axios from "axios";

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
  responseTime?: number | null;
  // Assignment fields
  assignedToUserId?: string | null;
  assignedToTeamId?: string | null;
  assignedToUser?: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  } | null;
  assignedToTeam?: {
    id: string;
    name: string;
  } | null;
}

export interface TicketStats {
  averageResponseTime: number | null;
  totalTickets: number;
  respondedTickets: number;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedToUserId?: string | null;
  assignedToTeamId?: string | null;
}

export interface UpdateTicketInput {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedToUserId?: string | null;
  assignedToTeamId?: string | null;
}

// Create an axios instance with default config
const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

export function useTickets() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeOrganization } = useOrganization();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    averageResponseTime: null,
    totalTickets: 0,
    respondedTickets: 0,
  });

  const getTickets = useCallback(async () => {
    if (!activeOrganization) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use GET method with query parameters for fetching tickets
      const response = await api.get("/api/v1/ticket", {
        params: {
          organizationId: activeOrganization.id,
        },
      });

      // Handle new response format with tickets and stats
      const { tickets: fetchedTickets, stats: fetchedStats } = response.data;

      setTickets(fetchedTickets);
      setStats(fetchedStats);

      return { tickets: fetchedTickets, stats: fetchedStats };
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : "An error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization]);

  const getTicket = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use GET method with path parameter for fetching a single ticket
      const response = await api.get(`/api/v1/ticket/${id}`);

      return response.data;
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : "An error occurred";
      setError(errorMessage);
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
        const response = await api.post("/api/v1/ticket", {
          ...input,
          organizationId: activeOrganization.id,
        });

        const newTicket = response.data;
        setTickets((prev) => [...prev, newTicket]);

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalTickets: prev.totalTickets + 1,
        }));

        return newTicket;
      } catch (err) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : "An error occurred";
        setError(errorMessage);
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
      const response = await api.put(`/api/v1/ticket/${input.id}`, input);

      const updatedTicket = response.data;
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );
      return updatedTicket;
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : "An error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTicket = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/api/v1/ticket/${id}`, {
        data: { id },
      });

      const deletedTicket = response.data;
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalTickets: prev.totalTickets - 1,
      }));

      return deletedTicket;
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : "An error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tickets,
    stats,
    isLoading,
    error,
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
  };
}
