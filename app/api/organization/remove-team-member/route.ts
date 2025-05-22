import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const teamId = searchParams.get("teamId");
    const organizationId = searchParams.get("organizationId");

    if (!memberId || !teamId || !organizationId) {
      return NextResponse.json(
        {
          error: "Member ID, team ID, and organization ID are required",
        },
        { status: 400 }
      );
    }

    // Get the member to be removed
    const memberToRemove = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!memberToRemove || memberToRemove.teamId !== teamId) {
      return NextResponse.json(
        { error: "Member not found in this team" },
        { status: 404 }
      );
    }

    // Check if the current user has permission to remove this member
    const currentUserMember = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        OR: [
          { teamId: teamId, role: { in: ["owner", "admin"] } }, // Team admin/owner
          { teamId: null, role: { in: ["owner", "admin"] } }, // Org admin/owner
        ],
      },
    });

    if (!currentUserMember) {
      return NextResponse.json(
        {
          error: "Insufficient permissions to remove team members",
        },
        { status: 403 }
      );
    }

    // Prevent removing yourself if you're the only owner
    if (
      memberToRemove.userId === session.user.id &&
      memberToRemove.role === "owner"
    ) {
      const otherOwners = await prisma.member.count({
        where: {
          teamId: teamId,
          role: "owner",
          id: { not: memberId },
        },
      });

      if (otherOwners === 0) {
        return NextResponse.json(
          {
            error:
              "Cannot remove yourself as the only team owner. Transfer ownership first.",
          },
          { status: 400 }
        );
      }
    }

    // Remove the member from the team
    await prisma.member.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
      message: `${memberToRemove.user.name} has been removed from ${memberToRemove.team?.name}`,
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
