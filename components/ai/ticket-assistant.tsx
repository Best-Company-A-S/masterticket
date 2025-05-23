import TicketAssistantAnimation from "@/components/ai/ticket-assistant-animation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { ScrollArea } from "@/components/ui/scroll-area";
import ShinyText from "@/components/ui/shine-text";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { useOrganization } from "@/lib/hooks/use-organization";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Filter,
  Loader2,
  Search,
  Send,
  Tag,
  User,
} from "lucide-react";
import Image from "next/image";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FaRobot } from "react-icons/fa";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  id?: string;
}

interface TicketAssistantProps {
  className?: string;
}

export interface TicketAssistantRef {
  sendMessage: (message: string) => void;
}

type CommandType = "basic" | "priority" | "search";

interface Command {
  label: string;
  command: string;
  type: CommandType;
  icon: React.ReactNode;
  options?: string[];
}

const TicketAssistant = forwardRef<TicketAssistantRef, TicketAssistantProps>(
  ({ className = "" }, ref) => {
    const [messages, setMessages] = useState<Message[]>([
      {
        role: "assistant",
        content:
          "Hi, I’m Ticketron 9000 🤖! I eat tickets for breakfast. Need to create one, find one, or just vibe with the system? Let’s do this!",
        timestamp: new Date(),
        id: "welcome-message",
      },
    ]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { activeOrganization } = useOrganization();
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [selectedCommand, setSelectedCommand] = useState<Command | null>(
      null
    );
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const { data: session } = authClient.useSession();

    // Expose the sendMessage method via ref
    useImperativeHandle(ref, () => ({
      sendMessage: (message: string) => {
        setInput(message);
        setTimeout(() => {
          handleSendMessage(message);
        }, 100);
      },
    }));

    // Scroll to bottom when messages change
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    const handleSendMessage = async (messageText?: string) => {
      const messageToSend = messageText || input;
      if (!messageToSend.trim() || isProcessing) return;

      // Reset command state
      setShowCommandPalette(false);
      setSelectedCommand(null);
      setSelectedOption(null);

      // Check if organization is available
      if (!activeOrganization) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Unable to process your request. Organization data is not available.",
            timestamp: new Date(),
            id: `error-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
          },
        ]);
        return;
      }

      const userMessage: Message = {
        role: "user",
        content: messageToSend,
        timestamp: new Date(),
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };

      // Add user message to chat
      setMessages((prev) => [...prev, userMessage]);

      // Add loading message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isLoading: true,
          id: `loading-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
        },
      ]);

      setInput("");
      setIsProcessing(true);

      try {
        // Call the AI assistant API
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...messages.filter((m) => !m.isLoading),
              userMessage,
            ].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            organizationId: activeOrganization.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response from assistant");
        }

        const data = await response.json();

        // Remove loading message and add assistant response
        setMessages((prev) => [
          ...prev.filter((m) => !m.isLoading),
          {
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
            id: `assistant-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
          },
        ]);
      } catch (error) {
        console.error("Error communicating with assistant:", error);

        // Remove loading message and add error message
        setMessages((prev) => [
          ...prev.filter((m) => !m.isLoading),
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again later.",
            timestamp: new Date(),
            id: `error-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
          },
        ]);
      }
      setIsProcessing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      } else if (e.key === "/" && !input) {
        e.preventDefault();
        setShowCommandPalette(true);
        setSelectedCommand(null);
      } else if (e.key === "Escape") {
        setShowCommandPalette(false);
        setSelectedCommand(null);
        setSelectedOption(null);
      }
    };

    const quickCommands: Command[] = [
      {
        label: "Create new ticket",
        command: "I need to create a new ticket",
        type: "basic",
        icon: <Tag className="h-3 w-3 text-muted-foreground" />,
      },
      {
        label: "Search tickets",
        command: "Search for tickets about",
        type: "search",
        icon: <Search className="h-3 w-3 text-muted-foreground" />,
      },
      {
        label: "Find tickets by priority",
        command: "Show me all",
        type: "priority",
        icon: <Filter className="h-3 w-3 text-muted-foreground" />,
        options: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      },
    ];

    const selectCommand = (command: Command) => {
      if (command.type === "basic") {
        setInput(command.command);
        setShowCommandPalette(false);
        inputRef.current?.focus();
      } else {
        setSelectedCommand(command);
      }
    };

    const selectOption = (option: string) => {
      if (selectedCommand) {
        if (selectedCommand.type === "priority") {
          setInput(
            `${
              selectedCommand.command
            } ${option.toLowerCase()} priority tickets`
          );
        } else if (selectedCommand.type === "search") {
          setInput(`${selectedCommand.command} ${option}`);
        }
        setShowCommandPalette(false);
        setSelectedCommand(null);
        setSelectedOption(null);
        inputRef.current?.focus();
      }
    };

    return (
      <Card
        className={cn(
          "flex flex-col h-[600px] shadow-lg border-primary/10 p-0",
          className
        )}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <TicketAssistantAnimation />
            <div>
              <h2 className="font-semibold text-lg">Ticketron 9000</h2>
              <p className="text-xs text-muted-foreground">Powered by Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar
                    className={cn(
                      "h-8 w-8 flex items-center justify-center shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {message.role === "user" ? (
                      <img
                        src={session?.user.image || ""}
                        alt="User avatar"
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <FaRobot className="h-4 w-4" />
                    )}
                  </Avatar>

                  <div
                    className={cn(
                      "rounded-lg p-4 shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card border rounded-tl-none"
                    )}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <ShinyText text="Thinking..." speed={2} pulse={true} />
                      </div>
                    ) : message.role === "user" ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <MarkdownRenderer content={message.content} />
                      </div>
                    )}
                    <div
                      className={cn(
                        "text-xs mt-2 flex items-center gap-1",
                        message.role === "user"
                          ? "text-primary-foreground/70 justify-end"
                          : "text-muted-foreground"
                      )}
                    >
                      {message.role === "assistant" && !message.isLoading && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/30">
          {showCommandPalette && (
            <div className="mb-2 bg-popover p-2 rounded-md shadow-lg border">
              <div className="text-xs font-medium mb-2 text-muted-foreground">
                {selectedCommand ? "Select an option:" : "Quick commands"}
              </div>
              <div className="space-y-1">
                {!selectedCommand
                  ? quickCommands.map((cmd, i) => (
                      <div
                        key={i}
                        className="p-2 hover:bg-accent rounded-md cursor-pointer flex items-center gap-2 text-sm"
                        onClick={() => selectCommand(cmd)}
                      >
                        {cmd.icon}
                        {cmd.label}
                      </div>
                    ))
                  : selectedCommand.options?.map((option, i) => (
                      <div
                        key={i}
                        className="p-2 hover:bg-accent rounded-md cursor-pointer flex items-center gap-2 text-sm"
                        onClick={() => selectOption(option)}
                      >
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            option === "LOW"
                              ? "bg-blue-400"
                              : option === "MEDIUM"
                              ? "bg-yellow-400"
                              : option === "HIGH"
                              ? "bg-orange-400"
                              : "bg-red-500"
                          )}
                        ></div>
                        {option}
                      </div>
                    ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() =>
                selectedOption ? null : setShowCommandPalette(false)
              }
              placeholder={
                isProcessing
                  ? "Please wait..."
                  : "Ask about tickets or type / for commands..."
              }
              className="flex-1 min-h-[60px] max-h-[120px] resize-none pr-12 bg-background"
              disabled={isProcessing}
            />
            <Button
              onClick={() => handleSendMessage()}
              className="self-end absolute right-2 bottom-2"
              size="icon"
              variant="ghost"
              disabled={!input.trim() || isProcessing}
            >
              <Send
                className={cn(
                  "h-4 w-4",
                  isProcessing ? "text-muted-foreground" : "text-primary"
                )}
              />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <div className="mt-2 text-xs text-center text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-muted rounded-sm">/</kbd> for
            quick commands •{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded-sm">Shift + Enter</kbd>{" "}
            for new line
          </div>
        </div>
      </Card>
    );
  }
);

TicketAssistant.displayName = "TicketAssistant";

export default TicketAssistant;
