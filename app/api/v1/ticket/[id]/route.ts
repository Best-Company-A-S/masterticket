import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/* Delete a ticket */
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const ticket = await prisma.ticket.delete({
      where: { id },
    });

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error("[TICKET_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}

/* Update a ticket */
export async function PUT(req: NextRequest) {
  const { id, title, description, priority, status } = await req.json();

  if (!id || !title || !description || !priority || !status) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { title, description, priority, status },
    });

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error("[TICKET_UPDATE]", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

/* Get a ticket by id */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing ticket ID" }, { status: 400 });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error("[TICKET_GET]", error);
    return NextResponse.json(
      { error: "Failed to get ticket" },
      { status: 500 }
    );
  }
}
