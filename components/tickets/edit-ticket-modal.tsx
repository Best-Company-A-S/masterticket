"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  useTickets,
  TicketPriority,
  TicketStatus,
  Ticket,
  UpdateTicketInput,
} from "@/lib/hooks/use-tickets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Pencil } from "lucide-react";
import { toast } from "sonner";

interface EditTicketModalProps {
  ticket: Ticket;
  buttonVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onTicketUpdated?: () => void;
  children?: React.ReactNode;
}

export interface EditTicketModalHandle {
  setOpen: (open: boolean) => void;
}

export default forwardRef<EditTicketModalHandle, EditTicketModalProps>(
  function EditTicketModal(
    {
      ticket,
      buttonVariant = "outline",
      buttonSize = "sm",
      className,
      onTicketUpdated,
      children,
    },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState(ticket.title);
    const [description, setDescription] = useState(ticket.description);
    const [priority, setPriority] = useState<TicketPriority>(
      ticket.priority as TicketPriority
    );
    const [status, setStatus] = useState<TicketStatus>(
      ticket.status as TicketStatus
    );

    const { updateTicket } = useTickets();

    // Expose setOpen function to parent components
    useImperativeHandle(ref, () => ({
      setOpen,
    }));

    // Update form when ticket prop changes
    useEffect(() => {
      setTitle(ticket.title);
      setDescription(ticket.description);
      setPriority(ticket.priority as TicketPriority);
      setStatus(ticket.status as TicketStatus);
    }, [ticket]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!title || !description) {
        toast.error("Missing fields", {
          description: "Please fill in all required fields",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        const updateData: UpdateTicketInput = {
          id: ticket.id,
          title,
          description,
          priority,
          status,
        };

        const result = await updateTicket(updateData);

        if (result) {
          toast.success("Ticket updated", {
            description: `Ticket #${result.id} was updated successfully`,
          });

          // Close modal
          setOpen(false);

          // Notify parent
          onTicketUpdated?.();
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to update ticket. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button
              variant={buttonVariant}
              size={buttonSize}
              className={className}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Ticket
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Ticket #{ticket.id}</DialogTitle>
              <DialogDescription>
                Update the details of this support ticket.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter ticket title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(value) =>
                      setPriority(value as TicketPriority)
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TicketPriority.LOW}>Low</SelectItem>
                      <SelectItem value={TicketPriority.MEDIUM}>
                        Medium
                      </SelectItem>
                      <SelectItem value={TicketPriority.HIGH}>High</SelectItem>
                      <SelectItem value={TicketPriority.CRITICAL}>
                        Critical
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as TicketStatus)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TicketStatus.OPEN}>Open</SelectItem>
                      <SelectItem value={TicketStatus.IN_PROGRESS}>
                        In Progress
                      </SelectItem>
                      <SelectItem value={TicketStatus.ON_HOLD}>
                        On Hold
                      </SelectItem>
                      <SelectItem value={TicketStatus.CLOSED}>
                        Closed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);
