"use client";

import { useState, useRef } from "react";
import TicketAssistant from "@/components/ai/ticket-assistant";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const ticketAssistantRef = useRef<{
    sendMessage: (message: string) => void;
  } | null>(null);

  const handleQuickAction = (message: string) => {
    if (ticketAssistantRef.current) {
      ticketAssistantRef.current.sendMessage(message);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Ticket Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Get help with ticket management using our AI assistant
        </p>
      </div>

      <Tabs defaultValue="chat" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
          <TabsTrigger value="help">Help & Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TicketAssistant ref={ticketAssistantRef} />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks you can ask the assistant to do
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button
                    onClick={() =>
                      handleQuickAction(
                        "I need to create a new high priority ticket for a server outage issue that's affecting our main application."
                      )
                    }
                    className="w-full text-left p-2 hover:bg-muted rounded-md text-sm"
                  >
                    Create a new high priority ticket
                  </button>
                  <button
                    onClick={() =>
                      handleQuickAction("Show me all critical tickets")
                    }
                    className="w-full text-left p-2 hover:bg-muted rounded-md text-sm"
                  >
                    Show me all critical tickets
                  </button>
                  <button
                    onClick={() =>
                      handleQuickAction("Search for tickets about login issues")
                    }
                    className="w-full text-left p-2 hover:bg-muted rounded-md text-sm"
                  >
                    Search for tickets about login issues
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tips</CardTitle>
                  <CardDescription>
                    Get the most out of the AI assistant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Be specific about priorities when creating tickets</li>
                    <li>
                      You can ask for tickets by status (open, closed, etc.)
                    </li>
                    <li>
                      Provide detailed descriptions for better ticket creation
                    </li>
                    <li>Ask for help if you're not sure what to do</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>How to Use the AI Assistant</CardTitle>
              <CardDescription>
                Learn how to get the most out of the AI ticket assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Creating Tickets</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You can ask the assistant to create tickets for you. Be sure
                  to include:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>A clear title</li>
                  <li>A detailed description of the issue</li>
                  <li>Priority level (LOW, MEDIUM, HIGH, or CRITICAL)</li>
                </ul>
                <p className="text-sm mt-2 bg-muted p-2 rounded-md">
                  Example: "Create a new ticket for a login issue that users are
                  experiencing on the mobile app. It should be high priority."
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Finding Tickets</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You can search for tickets by priority or keywords:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Search by priority: "Show me all critical tickets"</li>
                  <li>
                    Search by keyword: "Find tickets related to payment
                    processing"
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Other Capabilities</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The assistant can also:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Provide information about the ticketing system</li>
                  <li>Explain priority levels and their meanings</li>
                  <li>Give recommendations on ticket management</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
