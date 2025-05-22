import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, organizationId } = await request.json();

    if (!name || !organizationId) {
      return NextResponse.json(
        { error: "Team name and organization ID are required" },
        { status: 400 }
      );
    }

    // Verify user has permission to create teams in this organization
    const userMember = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        role: { in: ["owner", "admin"] }, // Only owners and admins can create teams
      },
    });

    if (!userMember) {
      return NextResponse.json(
        { error: "Insufficient permissions to create teams" },
        { status: 403 }
      );
    }

    // Check if team name already exists in this organization
    const existingTeam = await prisma.team.findFirst({
      where: {
        name: name.trim(),
        organizationId,
      },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: "A team with this name already exists" },
        { status: 400 }
      );
    }

    // Create the team and add the creator as a member in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the team
      const team = await tx.team.create({
        data: {
          name: name.trim(),
          organizationId,
        },
      });

      // Add the creator as a team member with admin role
      // Determine the role based on the creator's organization role
      const teamRole = userMember.role === "owner" ? "owner" : "admin";

      const teamMember = await tx.member.create({
        data: {
          userId: session.user.id,
          organizationId,
          teamId: team.id,
          role: teamRole,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      return {
        team,
        teamMember,
      };
    });

    return NextResponse.json({
      success: true,
      team: {
        id: result.team.id,
        name: result.team.name,
        organizationId: result.team.organizationId,
        createdAt: result.team.createdAt.toISOString(),
        updatedAt: result.team.updatedAt.toISOString(),
        members: [
          {
            id: result.teamMember.id,
            role: result.teamMember.role,
            user: result.teamMember.user,
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
