import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/* Create a new ticket */
export async function POST(req: NextRequest) {
  const { title, description, priority, status, organizationId } =
    await req.json();

  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!title || !description || !priority || !status || !organizationId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        status,
        organizationId,
      },
    });

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error("[TICKET_CREATION]", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}

/* Get all tickets for an organization */
export async function GET(req: NextRequest) {
  // Get organizationId from URL search params
  const url = new URL(req.url);
  const organizationId = url.searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json(
      { error: "Missing organizationId parameter" },
      { status: 400 }
    );
  }

  try {
    // Get tickets with their comments
    const tickets = await prisma.ticket.findMany({
      where: {
        organizationId,
      },
      include: {
        comments: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // Calculate response times for tickets that have comments
    const ticketsWithResponseTime = tickets.map((ticket) => {
      const firstComment = ticket.comments[0];
      let responseTime = null;

      if (firstComment) {
        // Calculate response time in hours
        const createdAt = new Date(ticket.createdAt);
        const firstResponseAt = new Date(firstComment.createdAt);
        const diffInMs = firstResponseAt.getTime() - createdAt.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        responseTime = diffInHours;
      }

      // Return ticket with response time and without comments to reduce payload size
      const { comments, ...ticketWithoutComments } = ticket;
      return {
        ...ticketWithoutComments,
        responseTime,
      };
    });

    // Calculate average response time
    const ticketsWithResponses = ticketsWithResponseTime.filter(
      (t) => t.responseTime !== null
    );
    const totalResponseTime = ticketsWithResponses.reduce(
      (sum, ticket) => sum + (ticket.responseTime || 0),
      0
    );
    const averageResponseTime =
      ticketsWithResponses.length > 0
        ? totalResponseTime / ticketsWithResponses.length
        : null;

    return NextResponse.json(
      {
        tickets: ticketsWithResponseTime,
        stats: {
          averageResponseTime,
          totalTickets: tickets.length,
          respondedTickets: ticketsWithResponses.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[TICKET_GET]", error);
    return NextResponse.json(
      { error: "Failed to get tickets" },
      { status: 500 }
    );
  }
}
