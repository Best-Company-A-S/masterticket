"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTickets } from "@/lib/hooks/use-tickets";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";

interface DeleteTicketDialogProps {
  ticketId: string;
  ticketSubject?: string;
  variant?: "button" | "menu-item";
  onDeleted?: () => void;
  children?: React.ReactNode;
}

export default function DeleteTicketDialog({
  ticketId,
  ticketSubject,
  variant = "button",
  onDeleted,
  children,
}: DeleteTicketDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { deleteTicket } = useTickets();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTicket(ticketId);
      if (result) {
        toast.success("Ticket deleted", {
          description: `Ticket #${ticketId} has been permanently deleted`,
        });

        // Close dialog
        setIsOpen(false);

        // Notify parent or redirect
        if (onDeleted) {
          onDeleted();
        } else {
          // If we're on the ticket details page, redirect to tickets list
          if (window.location.pathname.includes(`/tickets/${ticketId}`)) {
            router.push("/dashboard/tickets");
          }
        }
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete ticket. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children ||
          (variant === "button" ? (
            <Button
              className="text-red-500 bg-secondary hover:bg-secondary/90 cursor-pointer"
              size="sm"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Ticket
            </Button>
          ) : (
            <div className="flex items-center text-red-500 cursor-pointer px-2 py-1.5 text-sm w-full">
              <Trash className="h-4 w-4 mr-2" />
              Delete ticket
            </div>
          ))}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete ticket{" "}
            <span className="font-medium">#{ticketId}</span>
            {ticketSubject && (
              <>
                {" - "}
                <span className="font-medium">{ticketSubject}</span>
              </>
            )}{" "}
            and all associated data including comments.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-secondary text-red-500 hover:bg-secondary/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
