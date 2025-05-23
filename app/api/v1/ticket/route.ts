import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/* Create a new ticket */
export async function POST(req: NextRequest) {
  const {
    title,
    description,
    priority,
    status,
    organizationId,
    assignedToUserId,
    assignedToTeamId,
  } = await req.json();

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
        // The migration is done, so we can use assignment fields
        assignedToUserId: assignedToUserId || null,
        assignedToTeamId: assignedToTeamId || null,
      },
      include: {
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        assignedToTeam: {
          select: {
            id: true,
            name: true,
          },
        },
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
    // Get tickets with their comments count and assignment information
    const tickets = await prisma.ticket.findMany({
      where: {
        organizationId,
      },
      include: {
        _count: {
          select: { comments: true },
        },
        // The migration is done, so we can include assignment fields
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        assignedToTeam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate average response time from tickets with response time
    const ticketsWithResponses = tickets.filter((t) => t.responseTime !== null);
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
        tickets: tickets.map((ticket) => {
          // Extract _count and return clean ticket object
          const { _count, ...ticketData } = ticket;
          return {
            ...ticketData,
            commentCount: _count.comments,
          };
        }),
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
