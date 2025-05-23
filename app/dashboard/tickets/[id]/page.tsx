"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  Pencil,
  Sparkles,
  ChevronDown,
  ChevronRight,
  User,
  Users,
} from "lucide-react";
import { useTickets, Ticket } from "@/lib/hooks/use-tickets";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "@/components/tickets/comment-section";
import EditTicketModal from "@/components/tickets/edit-ticket-modal";
import DeleteTicketDialog from "@/components/tickets/delete-ticket-dialog";
import ShinyText from "@/components/ui/shine-text";
import LoadingDots from "@/components/ui/loading-dots";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getTicket, isLoading, error } = useTickets();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isOriginalExpanded, setIsOriginalExpanded] = useState(false);
  const editModalRef = useRef<{ setOpen: (open: boolean) => void } | null>(
    null
  );

  const fetchTicket = async () => {
    if (params.id) {
      const result = await getTicket(params.id as string);
      if (result) {
        setTicket(result);
        setCommentCount((result as any).commentCount || 0);
      }
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [params.id, getTicket]);

  // Check for edit query param and open modal if present
  useEffect(() => {
    const shouldOpenEditModal = searchParams.get("edit") === "true";
    if (shouldOpenEditModal && editModalRef.current && ticket) {
      editModalRef.current.setOpen(true);
      // Remove the edit param from the URL to avoid reopening on refresh
      router.replace(`/dashboard/tickets/${params.id}`);
    }
  }, [searchParams, ticket, router, params.id]);

  // Handle comment count updates
  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };

  // Handle ticket update
  const handleTicketUpdated = () => {
    fetchTicket();
  };

  // Format response time from hours to a readable format
  const formatResponseTime = (hours: number | null): string => {
    if (hours === null) return "Not yet responded";

    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10} hours`;
    } else {
      return `${Math.round((hours / 24) * 10) / 10} days`;
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      case "CLOSED":
        return "outline";
      case "ON_HOLD":
        return "destructive";
      default:
        return "default";
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "outline";
      case "MEDIUM":
        return "secondary";
      case "HIGH":
        return "default";
      case "CRITICAL":
        return "destructive";
      default:
        return "default";
    }
  };

  // Summarize ticket description using API endpoint
  const summarizeTicket = async () => {
    if (!ticket || !ticket.description || ticket.description.length < 100)
      return;

    setIsSummarizing(true);
    try {
      const response = await fetch("/api/tickets/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: ticket.description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate summary");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error summarizing ticket:", error);
      setSummary("Failed to generate summary. Please try again later.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Toggle original content visibility
  const toggleOriginalContent = () => {
    setIsOriginalExpanded(!isOriginalExpanded);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to tickets
          </Button>
          <h1 className="text-2xl font-bold">Ticket Details</h1>
        </div>
        {ticket && (
          <div className="flex items-center gap-2">
            <EditTicketModal
              ref={editModalRef}
              ticket={ticket}
              onTicketUpdated={handleTicketUpdated}
            />
            <DeleteTicketDialog
              ticketId={ticket.id}
              ticketSubject={ticket.title}
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading ticket details...</div>
      ) : error ? (
        <div className="text-red-500 p-8">{error}</div>
      ) : ticket ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <div className="text-sm text-muted-foreground">Ticket ID</div>
                <CardTitle className="text-xl">#{ticket.id}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(ticket.status)}>
                  {ticket.status.replace("_", " ")}
                </Badge>
                <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{ticket.title}</h2>
                  <div className="text-sm text-muted-foreground mt-1">
                    Created {formatDistanceToNow(new Date(ticket.createdAt))}{" "}
                    ago
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Description</div>
                      {ticket.description &&
                        ticket.description.length > 100 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-primary hover:text-primary/80"
                            onClick={summarizeTicket}
                            disabled={isSummarizing}
                          >
                            <Sparkles className="h-3 w-3" />
                            {isSummarizing ? (
                              <div className="flex items-center gap-2">
                                <ShinyText
                                  text="Summarizing"
                                  speed={3}
                                  pulse={true}
                                />
                                <LoadingDots color="var(--primary)" />
                              </div>
                            ) : (
                              "AI Summary"
                            )}
                          </Button>
                        )}
                    </div>
                    {summary ? (
                      <div className="mt-2">
                        <div className="bg-muted/50 p-3 rounded-md mb-2 animate-fade-in">
                          <div className="flex items-center mb-1">
                            <Sparkles className="h-3 w-3 mr-1 text-primary animate-pulse" />
                            <span className="text-xs font-medium text-primary">
                              AI SUMMARY
                            </span>
                          </div>
                          <MarkdownRenderer
                            content={summary}
                            className="text-sm"
                          />
                        </div>

                        <div className="mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full justify-between p-2 h-auto"
                            onClick={toggleOriginalContent}
                          >
                            <span className="font-medium">
                              Original Content
                            </span>
                            {isOriginalExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>

                          {isOriginalExpanded && (
                            <div className="animate-fade-in mt-2 border border-border/50 rounded-md p-3">
                              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                {ticket.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 whitespace-pre-wrap">
                        {ticket.description}
                      </p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Response Time</div>
                        <div>
                          {formatResponseTime(ticket.responseTime || null)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Comments</div>
                        <div>{commentCount} comments</div>
                      </div>
                    </div>

                    {/* Assignment Information */}
                    {ticket.assignedToUser && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Assigned To</div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
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
                            <span>
                              {ticket.assignedToUser.name ||
                                ticket.assignedToUser.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {ticket.assignedToTeam && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">
                            Assigned Team
                          </div>
                          <div>{ticket.assignedToTeam.name}</div>
                        </div>
                      </div>
                    )}

                    {!ticket.assignedToUser && !ticket.assignedToTeam && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Assignment</div>
                          <div className="text-muted-foreground">
                            Unassigned
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <CommentSection
              ticketId={ticket.id}
              onCommentCountChange={handleCommentCountChange}
            />
          </div>
        </div>
      ) : (
        <div className="text-center p-8">Ticket not found</div>
      )}
    </div>
  );
}
