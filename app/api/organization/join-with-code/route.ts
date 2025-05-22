import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid invitation code" },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: {
        organization: true,
        team: true,
        inviter: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation code" },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation code has expired" },
        { status: 400 }
      );
    }

    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Invitation code has already been used" },
        { status: 400 }
      );
    }

    // Check if user is already a member of this organization
    const existingMember = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: invitation.organizationId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this organization" },
        { status: 400 }
      );
    }

    // Create member record
    const member = await prisma.member.create({
      data: {
        userId: session.user.id,
        organizationId: invitation.organizationId,
        teamId: invitation.teamId,
        role: invitation.role,
      },
      include: {
        organization: true,
        team: true,
        user: true,
      },
    });

    // Update invitation status to accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    });

    // Set as active organization if user doesn't have one
    const userSession = await prisma.session.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (userSession && !userSession.activeOrganizationId) {
      await prisma.session.update({
        where: { id: userSession.id },
        data: { activeOrganizationId: invitation.organizationId },
      });
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        role: member.role,
        organizationName: member.organization.name,
        teamName: member.team?.name,
        joinedAt: member.createdAt,
      },
    });
  } catch (error) {
    console.error("Error joining organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
