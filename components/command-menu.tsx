"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  PlusCircle,
  Search,
  Ticket,
  MessageSquare,
  ListFilter,
  Users,
  Building,
  Loader2,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useTickets } from "@/lib/hooks/use-tickets";
import { useOrganization } from "@/lib/hooks/use-organization";
import { TicketPriority, TicketStatus } from "@/lib/hooks/use-tickets";
import { useState } from "react";
import { toast } from "sonner";

export function CommandMenu() {
  const router = useRouter();
  const { tickets, getTickets, createTicket } = useTickets();
  const { activeOrganization } = useOrganization();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Quick create ticket state
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");

  // Show command menu shortcut hint
  const [showShortcutHint, setShowShortcutHint] = useState(true);

  // Hide shortcut hint after 5 seconds
  React.useEffect(() => {
    if (showShortcutHint) {
      const timer = setTimeout(() => {
        setShowShortcutHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showShortcutHint]);

  // Load tickets when command menu is opened
  React.useEffect(() => {
    if (open && !tickets?.length) {
      getTickets();
    }
  }, [open, tickets, getTickets]);

  // Handle keyboard shortcut to open command menu (⌘+J)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      } else if (open) {
        // Handle keyboard shortcuts when command menu is open
        if (e.key === "n" && !isCreatingTicket) {
          e.preventDefault();
          setIsCreatingTicket(true);
          setQuickTitle("");
        } else if (e.key === "Escape" && isCreatingTicket) {
          e.preventDefault();
          setIsCreatingTicket(false);
          setQuickTitle("");
          setSearchQuery("");
        } else if (e.key === "Enter" && isCreatingTicket && quickTitle.trim()) {
          e.preventDefault();
          handleQuickCreateTicket();
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, isCreatingTicket, quickTitle]);

  // Filter tickets based on search query
  const filteredTickets = React.useMemo(() => {
    if (!tickets || !searchQuery) return [];

    return tickets
      .filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5); // Limit to 5 results
  }, [tickets, searchQuery]);

  // Handle navigation to a specific ticket
  const navigateToTicket = (ticketId: string) => {
    setOpen(false);
    router.push(`/dashboard/tickets/${ticketId}`);
  };

  // Handle quick create ticket
  const handleQuickCreateTicket = async () => {
    if (!quickTitle.trim() || !activeOrganization) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await createTicket({
        title: quickTitle,
        description: `Created via command menu: ${quickTitle}`,
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
      });

      if (result) {
        toast.success("Ticket created", {
          description: `Ticket #${result.id} was created successfully`,
        });
        setQuickTitle("");
        setIsCreatingTicket(false);
        setOpen(false);
        router.push(`/dashboard/tickets/${result.id}`);
      }
    } catch (error) {
      toast.error("Failed to create ticket", {
        description: "Please try again or create it from the tickets page",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation to create ticket page/modal
  const navigateToCreateTicket = () => {
    setOpen(false);
    router.push("/dashboard/tickets?create=true");
  };

  // Handle navigation to AI assistant
  const navigateToAIAssistant = () => {
    setOpen(false);
    router.push("/dashboard/ai-assistant");
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // If input starts with "new:" or "create:", switch to quick create mode
    if (value.match(/^(new:|create:)\s*(.+)/i)) {
      const title = value.replace(/^(new:|create:)\s*/i, "");
      setQuickTitle(title);
      setIsCreatingTicket(true);
    } else {
      setIsCreatingTicket(false);
    }
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={
            isCreatingTicket
              ? "Enter ticket title..."
              : "Type a command or search for tickets... (try 'new: My ticket')"
          }
          value={isCreatingTicket ? quickTitle : searchQuery}
          onValueChange={isCreatingTicket ? setQuickTitle : handleSearchChange}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Quick Create Ticket */}
          {isCreatingTicket && (
            <CommandGroup heading="Create New Ticket">
              <CommandItem
                onSelect={handleQuickCreateTicket}
                disabled={isLoading || !quickTitle.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Creating ticket...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Create: {quickTitle || "Enter a title"}</span>
                  </>
                )}
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setIsCreatingTicket(false);
                  setQuickTitle("");
                  setSearchQuery("");
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Cancel and return to search</span>
              </CommandItem>
            </CommandGroup>
          )}

          {/* Search Results */}
          {!isCreatingTicket && (
            <>
              {/* Quick Actions */}
              <CommandGroup heading="Quick Actions">
                <CommandItem
                  onSelect={() => {
                    setIsCreatingTicket(true);
                    setQuickTitle("");
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Create New Ticket</span>
                  <CommandShortcut>N</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => navigateToAIAssistant()}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Talk to AI Assistant</span>
                  <CommandShortcut>A</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    router.push("/dashboard/tickets");
                  }}
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  <span>View All Tickets</span>
                  <CommandShortcut>T</CommandShortcut>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              {/* Navigation */}
              <CommandGroup heading="Navigation">
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    router.push("/dashboard");
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                  <CommandShortcut>D</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    router.push("/dashboard/tickets");
                  }}
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  <span>Tickets</span>
                  <CommandShortcut>T</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    router.push("/dashboard/teams");
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Teams</span>
                  <CommandShortcut>M</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    router.push("/dashboard/organization");
                  }}
                >
                  <Building className="mr-2 h-4 w-4" />
                  <span>Organization</span>
                  <CommandShortcut>O</CommandShortcut>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              {/* Search Results */}
              {filteredTickets.length > 0 && (
                <>
                  <CommandGroup heading="Tickets">
                    {filteredTickets.map((ticket) => (
                      <CommandItem
                        key={ticket.id}
                        onSelect={() => navigateToTicket(ticket.id)}
                      >
                        <Ticket className="mr-2 h-4 w-4" />
                        <span>
                          #{ticket.id}: {ticket.title}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Settings */}
              <CommandGroup heading="Settings">
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    router.push("/dashboard/profile");
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <CommandShortcut>P</CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    router.push("/dashboard/settings");
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <CommandShortcut>S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>

      {/* Keyboard Shortcut Hint */}
      {showShortcutHint && (
        <div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-3 flex items-center gap-2 text-sm z-50 animate-fade-in"
          onClick={() => setShowShortcutHint(false)}
        >
          <span>Press</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold">
            ⌘
          </kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold">
            J
          </kbd>
          <span>anytime to open command menu</span>
        </div>
      )}
    </>
  );
}
