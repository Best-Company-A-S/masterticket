import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId, newRole, teamId, organizationId } = await request.json();

    if (!memberId || !newRole || !teamId || !organizationId) {
      return NextResponse.json(
        {
          error:
            "Member ID, new role, team ID, and organization ID are required",
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["owner", "admin", "member"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        {
          error: "Invalid role. Must be one of: owner, admin, member",
        },
        { status: 400 }
      );
    }

    // Get the member to be updated
    const memberToUpdate = await prisma.member.findUnique({
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

    if (!memberToUpdate || memberToUpdate.teamId !== teamId) {
      return NextResponse.json(
        { error: "Member not found in this team" },
        { status: 404 }
      );
    }

    // Check if the current user has permission to update roles
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
          error: "Insufficient permissions to update member roles",
        },
        { status: 403 }
      );
    }

    // Prevent demoting yourself if you're the only owner
    if (
      memberToUpdate.userId === session.user.id &&
      memberToUpdate.role === "owner" &&
      newRole !== "owner"
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
              "Cannot demote yourself as the only team owner. Promote someone else first.",
          },
          { status: 400 }
        );
      }
    }

    // Update the member's role
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: { role: newRole },
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

    return NextResponse.json({
      success: true,
      message: `${updatedMember.user.name}'s role has been updated to ${newRole}`,
      member: {
        id: updatedMember.id,
        role: updatedMember.role,
        user: updatedMember.user,
        team: updatedMember.team,
      },
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
