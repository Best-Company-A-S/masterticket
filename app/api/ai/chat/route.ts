import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { TicketPriority } from "@/lib/generated/prisma";

// Define function declarations for ticket operations
const createTicketFunctionDeclaration = {
  name: "create_ticket",
  description: "Creates a new ticket in the system with the provided details.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "Title of the ticket",
      },
      description: {
        type: Type.STRING,
        description: "Detailed description of the ticket",
      },
      priority: {
        type: Type.STRING,
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        description: "Priority level of the ticket",
      },
      organizationId: {
        type: Type.STRING,
        description: "ID of the organization this ticket belongs to",
      },
    },
    required: ["title", "description", "priority", "organizationId"],
  },
};

const getTicketsByPriorityFunctionDeclaration = {
  name: "get_tickets_by_priority",
  description: "Retrieves tickets filtered by priority level",
  parameters: {
    type: Type.OBJECT,
    properties: {
      priority: {
        type: Type.STRING,
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        description: "Priority level to filter tickets by",
      },
      organizationId: {
        type: Type.STRING,
        description: "ID of the organization to filter tickets by",
      },
    },
    required: ["priority", "organizationId"],
  },
};

const searchTicketsFunctionDeclaration = {
  name: "search_tickets",
  description:
    "Searches for tickets based on a keyword in the title or description",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "Search query to find in ticket title or description",
      },
      organizationId: {
        type: Type.STRING,
        description: "ID of the organization to search tickets in",
      },
    },
    required: ["query", "organizationId"],
  },
};

export async function POST(request: NextRequest) {
  try {
    const { messages, organizationId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API is not configured" },
        { status: 500 }
      );
    }

    // Get organization details for context
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, id: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format messages for the Gemini API
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Add system message at the beginning
    formattedMessages.unshift({
      role: "model",
      parts: [
        {
          text: `You are a helpful ticket management assistant for the organization "${organization.name}". You can help users create tickets, find tickets by priority, or search for tickets.
        
When creating a ticket, ask for a title, description, and priority level (LOW, MEDIUM, HIGH, or CRITICAL) But if the user ask you to generate the title, description or priority level, you should generate it.
When searching for tickets, provide the results in a clear, formatted way using markdown. 
Always be professional, helpful, and concise in your responses.

IMPORTANT: You already have the organization ID (${organizationId}) and will automatically use it for all operations. DO NOT ask the user for organization ID.`,
        },
      ],
    });

    // Generate response with function calling
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: formattedMessages,
      config: {
        temperature: 0.2,
        tools: [
          {
            functionDeclarations: [
              createTicketFunctionDeclaration,
              getTicketsByPriorityFunctionDeclaration,
              searchTicketsFunctionDeclaration,
            ],
          },
        ],
      },
    });

    // Check for function calls in the response
    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0];
      console.log(`Function to call: ${functionCall.name}`);
      console.log(`Arguments:`, functionCall.args);

      // Execute the function based on name
      let result;
      if (functionCall.name === "create_ticket" && functionCall.args) {
        const { title, description, priority } = functionCall.args as {
          title: string;
          description: string;
          priority: TicketPriority;
        };

        // Create a new ticket in the database
        const newTicket = await prisma.ticket.create({
          data: {
            title,
            description,
            priority,
            status: "OPEN",
            organizationId,
          },
        });

        result = { success: true, ticket: newTicket };
      } else if (
        functionCall.name === "get_tickets_by_priority" &&
        functionCall.args
      ) {
        const { priority } = functionCall.args as {
          priority: TicketPriority;
        };

        // Get tickets by priority from the database
        const tickets = await prisma.ticket.findMany({
          where: {
            priority,
            organizationId,
          },
        });

        result = { success: true, tickets };
      } else if (functionCall.name === "search_tickets" && functionCall.args) {
        const { query } = functionCall.args as {
          query: string;
        };

        // Search tickets in the database
        const tickets = await prisma.ticket.findMany({
          where: {
            organizationId,
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        });

        result = { success: true, tickets };
      }

      // Add the function response to the conversation
      formattedMessages.push({
        role: "model",
        parts: [
          {
            text: JSON.stringify({
              functionCall: {
                name: functionCall.name,
                args: {
                  ...functionCall.args,
                  organizationId, // Always ensure organizationId is included
                },
              },
            }),
          },
        ],
      });

      formattedMessages.push({
        role: "user",
        parts: [
          {
            text: JSON.stringify({
              functionResponse: {
                name: functionCall.name,
                response: { result },
              },
            }),
          },
        ],
      });

      // Get the final response with the function result
      const finalResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: formattedMessages,
        config: {
          temperature: 0.2,
        },
      });

      if (finalResponse.text) {
        return NextResponse.json({ response: finalResponse.text });
      } else {
        // Fallback response if text is not available
        let fallbackResponse = "I've processed your request.";

        if (
          functionCall.name === "create_ticket" &&
          result &&
          "ticket" in result
        ) {
          fallbackResponse = `I've created a new ticket with ID: ${result.ticket.id}, titled "${result.ticket.title}" with ${result.ticket.priority} priority.`;
        } else if (
          (functionCall.name === "get_tickets_by_priority" ||
            functionCall.name === "search_tickets") &&
          result &&
          "tickets" in result
        ) {
          fallbackResponse = `I found ${result.tickets.length} tickets matching your request.`;
        }

        return NextResponse.json({ response: fallbackResponse });
      }
    } else {
      // No function call, just return the text response
      return NextResponse.json({
        response:
          response.text ||
          "I'm not sure how to help with that. Could you try rephrasing your question?",
      });
    }
  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
