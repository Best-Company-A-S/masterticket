import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the ticket ID from query parameters if needed
    const ticketId = request.nextUrl.searchParams.get("ticketId");

    // Query based on whether ticketId is provided
    const comments = ticketId
      ? await prisma.ticketComment.findMany({
          where: { ticketId },
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
        })
      : await prisma.ticketComment.findMany({
          take: 100, // Limit results
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
          orderBy: { createdAt: "desc" },
        });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("[DASHBOARD_COMMENTS_GET]", error);
    return NextResponse.json(
      { error: "Failed to get comments" },
      { status: 500 }
    );
  }
}
