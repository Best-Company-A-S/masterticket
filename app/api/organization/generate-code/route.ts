import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Custom function to generate 6-digit invitation codes
function generateInvitationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId, teamId, role } = await request.json();

    // Verify user has permission to invite members to this organization
    const member = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Generate unique code
    let code: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = generateInvitationCode();
      const existing = await prisma.invitation.findUnique({
        where: { code },
      });

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "Unable to generate unique code" },
        { status: 500 }
      );
    }

    // Create invitation with code
    const invitation = await prisma.invitation.create({
      data: {
        code: code!,
        inviterId: session.user.id,
        organizationId,
        teamId: teamId || null,
        role,
        status: "pending",
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      },
      include: {
        organization: true,
        team: true,
        inviter: true,
      },
    });

    return NextResponse.json({
      success: true,
      code: invitation.code,
      invitation: {
        id: invitation.id,
        code: invitation.code,
        role: invitation.role,
        organizationName: invitation.organization.name,
        teamName: invitation.team?.name,
        inviterName: invitation.inviter.name,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error generating invitation code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
