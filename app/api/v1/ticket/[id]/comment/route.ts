import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/* Add a comment to a ticket */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content, parentId } = await req.json();

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
      where: { id },
      include: { comments: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // If parentId is provided, check if the parent comment exists
    if (parentId) {
      const parentComment = await prisma.ticketComment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      // Ensure the parent comment belongs to the same ticket
      if (parentComment.ticketId !== id) {
        return NextResponse.json(
          { error: "Parent comment does not belong to this ticket" },
          { status: 400 }
        );
      }
    }

    // Create the comment
    const comment = await prisma.ticketComment.create({
      data: {
        content,
        ticketId: id,
        authorId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // If this is the first comment and not a reply, calculate and update the response time
    if (ticket.comments.length === 0 && !parentId) {
      const createdAt = new Date(ticket.createdAt);
      const commentCreatedAt = new Date();
      const diffInMs = commentCreatedAt.getTime() - createdAt.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      // Update the ticket with the response time
      await prisma.ticket.update({
        where: { id },
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const comments = await prisma.ticketComment.findMany({
      where: { ticketId: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
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
