"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  MessageSquare,
  Pencil,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import DeleteTicketDialog from "./delete-ticket-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type Ticket = {
  id: string;
  title: string;
  status: "OPEN" | "CLOSED" | "IN_PROGRESS" | "ON_HOLD";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  resolutionTime: string;
  commentCount?: number;
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
};

export const columns: ColumnDef<Ticket>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Ticket ID",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/tickets/${row.getValue("id")}`}
        className="font-medium text-primary hover:underline"
      >
        #{row.getValue("id")}
      </Link>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Subject
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <Badge
          variant={
            status === "OPEN"
              ? "default"
              : status === "IN_PROGRESS"
              ? "secondary"
              : status === "CLOSED"
              ? "outline"
              : "destructive"
          }
        >
          {status.replace("_", " ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;

      return (
        <Badge
          variant={
            priority === "LOW"
              ? "outline"
              : priority === "MEDIUM"
              ? "secondary"
              : priority === "HIGH"
              ? "default"
              : "destructive"
          }
        >
          {priority}
        </Badge>
      );
    },
  },
  {
    id: "assignment",
    header: "Assigned To",
    cell: ({ row }) => {
      const ticket = row.original;

      if (ticket.assignedToUser) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={ticket.assignedToUser.image || ""}
                      alt={ticket.assignedToUser.name || ""}
                    />
                    <AvatarFallback className="text-xs">
                      {ticket.assignedToUser.name
                        ?.substring(0, 2)
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[100px]">
                    {ticket.assignedToUser.name || ticket.assignedToUser.email}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{ticket.assignedToUser.name || ""}</p>
                <p className="text-xs text-muted-foreground">
                  {ticket.assignedToUser.email}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      if (ticket.assignedToTeam) {
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{ticket.assignedToTeam.name}</span>
          </div>
        );
      }

      return <span className="text-muted-foreground">Unassigned</span>;
    },
  },
  {
    accessorKey: "resolutionTime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Response Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("resolutionTime")}</div>,
  },
  {
    accessorKey: "commentCount",
    header: "Comments",
    cell: ({ row }) => {
      const count = row.original.commentCount || 0;
      return (
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>{count}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ticket = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/tickets/${ticket.id}`}>View details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/tickets/${ticket.id}?edit=true`}>
                <div className="flex items-center">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit ticket
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-red-500 cursor-pointer">
              <DeleteTicketDialog
                ticketId={ticket.id}
                ticketSubject={ticket.title}
                variant="menu-item"
                onDeleted={() => {
                  // Force reload of the tickets page to refresh the list
                  window.location.reload();
                }}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
