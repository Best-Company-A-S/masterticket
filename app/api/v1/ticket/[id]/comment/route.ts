import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/* Add a comment to a ticket */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ticketId = params.id;
  const { content } = await req.json();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!content) {
    return NextResponse.json(
      { error: "Comment content is required" },
      { status: 400 }
    );
  }

  try {
    // Get the ticket to check if it exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { comments: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Create the comment
    const comment = await prisma.ticketComment.create({
      data: {
        content,
        ticketId,
        authorId: session.user.id,
      },
    });

    // If this is the first comment, calculate and update the response time
    if (ticket.comments.length === 0) {
      const createdAt = new Date(ticket.createdAt);
      const commentCreatedAt = new Date();
      const diffInMs = commentCreatedAt.getTime() - createdAt.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      // Update the ticket with the response time
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { responseTime: diffInHours },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("[COMMENT_CREATION]", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

/* Get all comments for a ticket */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ticketId = params.id;

  try {
    const comments = await prisma.ticketComment.findMany({
      where: { ticketId },
      include: { author: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("[COMMENTS_GET]", error);
    return NextResponse.json(
      { error: "Failed to get comments" },
      { status: 500 }
    );
  }
}
